"use client";

import { useEffect, useRef } from "react";
import { FlipDirection, FlipPhase } from "@/hooks/usePageFlip";

interface PageFlipProps {
    flipDir: FlipDirection;
    phase: FlipPhase;
    children: React.ReactNode; // front face (current month)
}

/**
 * Wraps calendar content in a 3D-flipping "page".
 *
 * Architecture:
 *   .scene  (perspective container)
 *     └─ .page  (the physical page — rotates on X axis from top)
 *          ├─ .face--front  (current month, visible at 0°)
 *          └─ .face--back   (same content inverted, visible after 90°)
 *
 * The "hinge" is at the top (spiral binding).
 * rotateX: 0° → -180° = flip forward (next month).
 * rotateX: 0° → +180° = flip backward (prev month).
 *
 * Shadow overlay fades in as the page reaches 90° (edge-on)
 * and fades out once it completes the arc.
 */
export function PageFlip({ flipDir, phase, children }: PageFlipProps) {
    const pageRef = useRef<HTMLDivElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const DURATION = 760; // ms — full 180° arc

    useEffect(() => {
        if (phase !== "flipping" || !pageRef.current || !shadowRef.current)
            return;

        const page = pageRef.current;
        const shadow = shadowRef.current;
        const direction = flipDir === "next" ? -1 : 1;

        startTimeRef.current = null;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const elapsed = timestamp - startTimeRef.current;
            const rawProgress = Math.min(elapsed / DURATION, 1); // 0 → 1

            // Ease: cubic-bezier approximation for realistic paper inertia
            const t = easeInOutCubic(rawProgress);
            const angle = direction * 180 * t; // 0 → ±180°

            page.style.transform = `rotateX(${angle}deg)`;

            // Shadow peaks at 90° (progress = 0.5), then disappears
            // A real page is darkest when it's edge-on (perpendicular to viewer)
            const shadowIntensity = Math.sin(rawProgress * Math.PI); // 0→1→0
            shadow.style.opacity = String(shadowIntensity * 0.45);

            if (rawProgress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [phase, flipDir]);

    // Reset when idle
    useEffect(() => {
        if (phase === "idle" && pageRef.current) {
            pageRef.current.style.transform = "rotateX(0deg)";
            if (shadowRef.current) shadowRef.current.style.opacity = "0";
        }
    }, [phase]);

    return (
        <div
            className="relative w-full"
            style={{
                perspective: "1200px",
                perspectiveOrigin: "50% 0%", // vanishing point at the top hinge
            }}
        >
            {/* The physical page */}
            <div
                ref={pageRef}
                className="relative w-full"
                style={{
                    transformOrigin: "top center", // hinge at spiral binding
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                    // Start flat
                    transform: "rotateX(0deg)",
                }}
            >
                {/* Front face — what you see before flip */}
                <div
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    {children}
                </div>

                {/* Back face — revealed after page passes 90° */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateX(180deg)",
                        background: "#f0ede8",
                    }}
                >
                    {/* Paper texture lines on back side */}
                    <div className="w-full h-full flex flex-col justify-start pt-16 px-8 opacity-20">
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-full mb-5"
                                style={{ height: "1px", background: "#888" }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Dynamic shadow overlay — simulates the shadow a page casts
          on itself as it bends */}
            <div
                ref={shadowRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: 0,
                    background: `linear-gradient(
            to bottom,
            rgba(0,0,0,0.0) 0%,
            rgba(0,0,0,0.3) 40%,
            rgba(0,0,0,0.55) 60%,
            rgba(0,0,0,0.3) 80%,
            rgba(0,0,0,0.0) 100%
          )`,
                    // Shadow is lighter at the top (hinge) and heavier in the middle
                    zIndex: 50,
                    transition: "none", // RAF-driven
                }}
            />
        </div>
    );
}

// Cubic ease in-out for natural paper inertia
function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
