"use client";

import React from "react";
import Image from "next/image";
import { MonthTheme } from "@/types/calendar";

interface HeroPageProps {
    theme: MonthTheme;
    year: number;
    onPrev: () => void;
    onNext: () => void;
}

export const HeroPage = React.forwardRef<HTMLDivElement, HeroPageProps>(
    ({ theme, year, onPrev, onNext }, ref) => {
        return (
            <div ref={ref} className="page hero-page" style={{ overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        background: "#111",
                        overflow: "hidden",
                    }}
                >
                {/* Background photo */}
                <Image
                    src={theme.imagePath}
                    alt={`${theme.month} – ${theme.sceneName}`}
                    fill
                    sizes="50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                />

                {/* Dark gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(160deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%)",
                    }}
                />

                {/* Left accent stripe */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-[5px]"
                    style={{ background: theme.accent }}
                />

                {/* Month / Year label */}
                <div className="absolute bottom-0 left-0 right-0 p-7 pb-6">
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
                        className="text-[3rem] font-bold leading-none tracking-tight text-white"
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

                {/* Navigation buttons */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPrev();
                    }}
                    aria-label="Previous month"
                    className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200"
                    style={{
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(6px)",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.28)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.14)")
                    }
                >
                    ‹
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    aria-label="Next month"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-all duration-200"
                    style={{
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(6px)",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.28)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                            "rgba(255,255,255,0.14)")
                    }
                >
                    ›
                </button>
                </div>
            </div>
        );
    }
);

HeroPage.displayName = "HeroPage";
