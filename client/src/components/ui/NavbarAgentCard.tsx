import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import characterAvatar from "../../assets/character_avatar.png";

function NavbarAgentCard({ isAbsolute }: {isAbsolute: boolean}) {
    const { agentId } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [aboutToClose, setAboutToClose] = useState(false);
    const [characterName, setCharacterName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/agents/`);
            const agents = await res.json();
            agents.agents.forEach((agent : any) => {
                if(agent.id === agentId) {
                    setCharacterName(agent.name);
                }
            });

        }

        fetchData().catch(console.error);
    },[]);

    return (
        <div className="z-[1000000]">
            <div className="flex justify-end px-10 py-10 fixed top-0 right-0">

                <div onClick={() =>{if(!isOpen) setIsOpen(true)}} className={`bg-[#0D0D0D] rounded-[30px] flex flex-col gap-2 pr-4 ${isOpen ? "pl-6 pr-6 py-4" : "cursor-pointer"} border border-[#4C82FB59] gap-5`}>
                    <div className={`flex justify-between`}>
                        <div className={`flex items-center ${isOpen ? "gap-6" : "gap-2"}`}>
                            <img width={isOpen ? "64px" : "42px"} height={isOpen ? "64px" : "42px"} className={isOpen ? "rounded-[15px]" : "rounded-full"} src={characterAvatar} />
                            <span className="text-sm font-medium min-w-[55px]">{characterName}</span>
                        </div>

                        {isOpen && (
                            <div onClick={() =>{setAboutToClose(true); setTimeout(() =>{ setAboutToClose(false); setIsOpen(false)}, 200) }} className={`bg-[#162332D4] w-[41px] h-[40px] flex items-center justify-center rounded-[10px] font-semibold cursor-pointer ${isOpen ? "animate-fadeIn" : ""} ${aboutToClose ? "animate-fadeOut" : ""}`}>
                                X
                            </div>
                        )}
                    </div>

                    {isOpen && (
                        <span className={`text-[12.5px] text-[#FFFFFFCC] ${isOpen ? "animate-fadeIn" : ""} ${aboutToClose ? "animate-fadeOut" : ""}`}>Lorem ipsum dolor sit amet, consec adipiscing elit, sed.</span>
                    )}

                    {isOpen && (
                        <div className={`flex gap-4 ${isOpen ? "animate-fadeIn" : ""} ${aboutToClose ? "animate-fadeOut" : ""}`}>
                            <button className="border border-white flex justify-center items-center rounded-[11px] text-[15.5px] mt-auto w-min bg-[#0D0D0D] p-1 px-7 gap-6 font-medium flex-1">
                                Functions
                            </button>

                            <button className="border border-white flex justify-center items-center rounded-[11px] text-[15.5px] mt-auto w-min bg-[#0D0D0D] p-1 px-7 gap-6 font-medium flex-1">
                                Configure
                            </button>
                        </div>
                    )}

                </div>

            </div>

            <div className={`${isAbsolute ? "absolute" : ""} h-[76px]`}></div>
        </div>
    );
}

export { NavbarAgentCard };

