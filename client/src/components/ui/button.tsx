import React from "react";
import { cn } from "@/lib/utils";


const PrimaryButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & {
        asChild?: boolean;
        isActive?: boolean;
    }
>(
    (
        {
            isActive = false,
            className,
            ...props
        },
        ref
    ) => {

        return (
            <button
                ref={ref}
                data-sidebar="menu-button"
                data-active={isActive}
                className={cn(
                    "border border-white flex justify-center rounded-[15px] p-1.5 text-[15.5px] font-medium w-full whitespace-nowrap flex *:flex *:justify-center *:w-full",
                    className,
                    (isActive ? "bg-[#FFFFFF]" : "bg-[#0D0D0D]"),
                    (isActive ? "text-[#000000]" : "text-[#FFFFFF]")
                )}
                {...props}
            />
        );
    }
)

export { PrimaryButton };