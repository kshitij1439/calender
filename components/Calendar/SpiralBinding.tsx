import React from "react";

interface SpiralBindingProps {
    count?: number;
}

export function SpiralBinding({ count = 18 }: SpiralBindingProps) {
    return (
        <div className="flex items-end justify-center gap-[14px] px-8 pb-0 relative z-10">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="w-[18px] h-[22px] rounded-full border-[3px] border-zinc-400 bg-transparent relative"
                    style={{
                        boxShadow:
                            "0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)",
                        background:
                            "linear-gradient(135deg, #888 0%, #555 50%, #777 100%)",
                    }}
                />
            ))}
        </div>
    );
}
