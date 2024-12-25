import { EditableInfoBox } from "./ui/EditableInfoBox.tsx";
import { PrimaryButton } from "./ui/button.tsx";

function CharacterBasicInformation({characterData} : {characterData?: any}){

    return (
        <div className="flex flex-col gap-12 w-full items-start pb-10 p-4">
            <div className="flex flex-col items-start">
                <span className="font-medium">Basic Information</span>
                <span className="text-[#FFFFFFB2]">lets start with the fundamentals of your AI agent</span>
            </div>

            <div className="flex gap-10 w-full">
                <div className="flex flex-col items-start gap-2 flex-1">
                    <span className="font-medium">Knowledge Areas</span>

                    <EditableInfoBox>
                        { characterData?.knowledge?.map((area: string, index: number) => (
                            <span className="pb-3 block" key={index}>{area}</span>
                        ))}

                    </EditableInfoBox>
                </div>

                <div className="flex flex-col items-start gap-2 flex-1">
                    <span className="font-medium">Key Topics </span>

                    <EditableInfoBox>
                        { characterData?.topics?.map((area: string, index: number) => (
                            area !== "" ? <span className="pb-3 block" key={index}>{area}</span> : null
                        ))}
                    </EditableInfoBox>
                </div>
            </div>

            <div className="flex flex-col items-start gap-2 w-full">
                <span className="font-medium">Bio</span>

                <EditableInfoBox className="max-h-[200px]">
                    <span>{characterData ? characterData.bio : "Loading..."}</span>
                </EditableInfoBox>

            </div>


            <PrimaryButton className="max-w-[300px] self-center">
                Configure
            </PrimaryButton>
        </div>
    );
}

export { CharacterBasicInformation };