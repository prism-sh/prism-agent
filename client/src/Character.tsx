import { BackgroundGradient } from "./components/ui/backgroundGradient";
import { NavbarAgentCard } from "./components/ui/NavbarAgentCard.tsx";
import { PrimaryButton } from "./components/ui/button.tsx";
import { CharacterBasicInformation } from "./components/character-basicInformation.tsx";
import { CharacterBackground } from "./components/character-background.tsx";
import { CharacterCommunicationStyle } from "./components/Character-communicationStyle.tsx";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const menuOptions = [
    {
        label: "Basic Information",
        component: CharacterBasicInformation,
    },
    {
        label: "Background",
        component: CharacterBackground,
    },
    {
        label: "Communication Style",
        component: CharacterCommunicationStyle,
    },
]

export default function Character() {

    const { agentId } = useParams();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [characterData, setCharacterData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/agents/${agentId}`);
            const data = await res.json();
            setCharacterData(data.character);
            console.log(data);
        }

        fetchData().catch(console.error);
    },[]);

    return (
        <div className="h-screen max-h-screen w-full flex flex-col items-center p-4">
            <BackgroundGradient/>
            <NavbarAgentCard isAbsolute={false}/>

            <div className="overflow-y-auto typeshit height-full w-full z-10">
                <div className="flex flex-col gap-10 w-full pt-16 pb-10 px-4">
                    <div className="flex gap-10 max-w-3xl mx-auto w-full">
                        {menuOptions.map((option, index) => (
                            <PrimaryButton
                                key={index}
                                isActive={selectedIndex === index}
                                onClick={() => setSelectedIndex(index)}
                            >
                                {option.label}
                            </PrimaryButton>
                        ))}
                    </div>
                </div>

                {React.createElement(menuOptions[selectedIndex].component, { characterData })}

            </div>

        </div>
    );
}
