import React from "react";
import { cn } from "@/lib/utils";

const EditableInfoBox = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        isEditable? : boolean
    }
>(({isEditable = false,className,...props},ref) => {
        return (
            <div
                className={cn(
                    "flex flex-col items-start *:text-left gap-2 border-[#FFFFFF54] border-[3px] rounded-[17px] px-4 py-3 text-[#FFFFFFCC] w-full max-h-[300px] min-h-[100px]",
                    className,
                )}
                {...props}
            >
                <div className="overflow-y-auto typeshit">
                    {props.children}
                </div>
            </div>
        );
    }
)

export { EditableInfoBox };