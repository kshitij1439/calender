"use client";

import Image from "next/image";
import { MonthTheme } from "@/types/calendar";

interface HeroPanelProps {
    theme: MonthTheme;
    year: number;
    onPrev: () => void;
    onNext: () => void;
}

export function HeroPanel({ theme, year, onPrev, onNext }: HeroPanelProps) {
    return (
        <div className="relative w-full md:w-[42%] md:min-w-[280px] overflow-hidden flex-shrink-0 h-[160px] md:h-auto md:min-h-0">
            {/* Background image */}
            <Image
                src={theme.imagePath}
                alt={`${theme.month} – ${theme.sceneName}`}
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                priority
            />

            {/* Gradient overlay */}
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(170deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)`,
                }}
            />

            {/* Left accent stripe */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 md:w-[5px]"
                style={{ background: theme.accent }}
            />

            {/* Month / Year label */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-5">
                <p
                    className="text-[10px] tracking-[5px] uppercase font-light mb-1"
                    style={{
                        color: "rgba(255,255,255,0.55)",
                        fontFamily: "var(--font-dm-sans)",
                    }}
                >
                    {year}
                </p>
                <h2
                    className="text-[2.4rem] md:text-[2.8rem] font-bold leading-none tracking-tight text-white"
                    style={{ fontFamily: "var(--font-playfair)" }}
                >
                    {theme.month}
                </h2>
                <p
                    className="text-[9px] tracking-[3px] uppercase mt-2"
                    style={{
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-dm-sans)",
                    }}
                >
                    {theme.sceneName}
                </p>
            </div>

            {/* Nav buttons */}
            <button
                onClick={onPrev}
                aria-label="Previous month"
                className="absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200"
                style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.25)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)")
                }
            >
                ‹
            </button>
            <button
                onClick={onNext}
                aria-label="Next month"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200"
                style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(6px)",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.25)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)")
                }
            >
                ›
            </button>
        </div>
    );
}
