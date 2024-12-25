import { PrimaryButton } from "./ui/button.tsx";
import { EditableInfoBox } from "./ui/EditableInfoBox.tsx";

const personalityTraits = [
    "Intelligent",
    "sarcastic",
    "funny",
    "meme-savvy",
    "Solana-centric",
    "insightful",
    "trendaware",
    "blockchain-fluent",
    "quick-witted",
    "technically specific"
];

function CharacterBackground({characterData} : {characterData?: any}) {
    return (
        <div className="flex flex-col gap-12 w-full items-start pb-10 p-4">

            <div className="flex flex-col items-start">
                <span className="font-medium">Background And Personality</span>
                <span className="text-[#FFFFFFB2]">Your agent’s character and background story</span>
            </div>

            <div className="flex flex-col items-start gap-2 w-full">
                <span className="font-medium">Background Story</span>

                <EditableInfoBox className="max-h-[200px]">
                    <span>{characterData ? characterData.lore : "Loading"}</span>
                </EditableInfoBox>
            </div>

            <div className="flex flex-col items-start gap-2">
                <span className="font-medium">Personality Traits</span>
                <div className="flex flex-wrap gap-2">
                    { characterData?.adjectives?.map((trait: string, index: number) => (
                        trait !== "" ? <span key={index} className="text-[#FFFFFFB2] border-[#6281E5] border-[2px] rounded-[16px] px-4 py-1 text-sm">{trait}</span> : null
                    ))}
                </div>
            </div>

            <PrimaryButton className="max-w-[300px] self-center">
                Configure
            </PrimaryButton>

        </div>
    );
}

export { CharacterBackground };