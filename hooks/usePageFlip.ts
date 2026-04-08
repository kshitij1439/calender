"use client";

import { useState, useCallback, useRef } from "react";

export type FlipDirection = "next" | "prev" | null;
export type FlipPhase = "idle" | "flipping" | "done";

interface UsePageFlipOptions {
    onMonthChange: (dir: 1 | -1) => void;
}

export function usePageFlip({ onMonthChange }: UsePageFlipOptions) {
    const [flipDir, setFlipDir] = useState<FlipDirection>(null);
    const [phase, setPhase] = useState<FlipPhase>("idle");
    const lockRef = useRef(false);

    const flip = useCallback(
        (dir: "next" | "prev") => {
            if (lockRef.current) return;
            lockRef.current = true;

            setFlipDir(dir);
            setPhase("flipping");

            // At 50% of the flip (page is edge-on), swap the month
            setTimeout(() => {
                onMonthChange(dir === "next" ? 1 : -1);
            }, 380); // half of 760ms total

            // After full flip, reset
            setTimeout(() => {
                setPhase("idle");
                setFlipDir(null);
                lockRef.current = false;
            }, 820);
        },
        [onMonthChange]
    );

    return { flip, flipDir, phase };
}
