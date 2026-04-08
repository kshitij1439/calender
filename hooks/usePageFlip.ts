"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type FlipDirection = "next" | "prev" | null;
export type FlipPhase = "idle" | "flipping" | "settling" | "manual";

interface UsePageFlipOptions {
    onMonthChange: (dir: 1 | -1) => void;
}

// Spring physics constants
const SPRING_STIFFNESS = 0.18;
const SPRING_DAMPING   = 0.72;
const VELOCITY_THRESHOLD = 0.0008;
const AUTO_FLIP_VELOCITY = 0.035; // speed at which we consider "thrown"

export function usePageFlip({ onMonthChange }: UsePageFlipOptions) {
    const [flipDir, setFlipDir]           = useState<FlipDirection>(null);
    const [phase, setPhase]               = useState<FlipPhase>("idle");
    const [manualProgress, setManualProgress] = useState(0);

    const lockRef        = useRef(false);
    const containerRef   = useRef<HTMLDivElement>(null);
    const progressRef    = useRef(0);      // smoothed display value
    const targetRef      = useRef(0);      // raw target
    const velocityRef    = useRef(0);      // spring velocity
    const rafRef         = useRef<number | null>(null);
    const phaseRef       = useRef<FlipPhase>("idle");
    const flipDirRef     = useRef<FlipDirection>(null);
    const monthChangedRef = useRef(false);
    const lastRawRef     = useRef(0);      // for velocity calculation during manual drag

    // Keep refs in sync with state
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { flipDirRef.current = flipDir; }, [flipDir]);

    // --- Spring animation loop ---
    const startSpringLoop = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        const tick = () => {
            const cur   = progressRef.current;
            const tgt   = targetRef.current;
            const vel   = velocityRef.current;
            const phase = phaseRef.current;

            const force    = (tgt - cur) * SPRING_STIFFNESS;
            const newVel   = (vel + force) * SPRING_DAMPING;
            const newProg  = cur + newVel;

            progressRef.current  = newProg;
            velocityRef.current  = newVel;

            setManualProgress(newProg);

            // Trigger month change at midpoint
            if (
                phase === "flipping" &&
                !monthChangedRef.current &&
                newProg >= 0.5
            ) {
                monthChangedRef.current = true;
                onMonthChange(flipDirRef.current === "next" ? 1 : -1);
            }

            const atRest = Math.abs(newVel) < VELOCITY_THRESHOLD && Math.abs(tgt - newProg) < 0.001;

            if (phase === "flipping" && (newProg >= 0.995 || (tgt === 1 && atRest))) {
                // Done
                progressRef.current = 0;
                velocityRef.current = 0;
                targetRef.current   = 0;
                setManualProgress(0);
                setPhase("idle");
                setFlipDir(null);
                lockRef.current = false;
                monthChangedRef.current = false;
                return;
            }

            if (phase === "settling") {
                if (atRest) {
                    // Snapped back to 0
                    progressRef.current = 0;
                    velocityRef.current = 0;
                    targetRef.current   = 0;
                    setManualProgress(0);
                    setPhase("idle");
                    setFlipDir(null);
                    lockRef.current = false;
                    return;
                }
            }

            if (phase === "idle") {
                if (atRest) return;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, [onMonthChange]);

    // --- Trigger full auto-flip (on click) ---
    const flip = useCallback(
        (dir: "next" | "prev") => {
            if (lockRef.current) return;
            lockRef.current = true;
            monthChangedRef.current = false;
            setFlipDir(dir);
            flipDirRef.current = dir;
            setPhase("flipping");
            phaseRef.current = "flipping";

            // If we already have some manual progress, resume from there
            targetRef.current  = 1;
            velocityRef.current = velocityRef.current > 0 ? velocityRef.current : 0.02;
            startSpringLoop();
        },
        [startSpringLoop]
    );

    // --- Mouse / Touch drag handlers ---
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (lockRef.current && phaseRef.current === "flipping") return;
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const W = rect.width;
        const H = rect.height;

        // Detect corner proximity for idle state
        if (phaseRef.current === "idle" || phaseRef.current === "manual") {
            const distBR = Math.hypot(W - x, H - y);
            const distBL = Math.hypot(x, H - y);

            // Only show peel if within 200px of a bottom corner
            const CORNER_RADIUS = 220;

            if (distBR < CORNER_RADIUS) {
                if (flipDirRef.current !== "next") {
                    setFlipDir("next");
                    flipDirRef.current = "next";
                }
            } else if (distBL < CORNER_RADIUS) {
                if (flipDirRef.current !== "prev") {
                    setFlipDir("prev");
                    flipDirRef.current = "prev";
                }
            } else {
                // Outside corners but phase is manual – keep direction for smooth retract
                if (phaseRef.current === "idle") {
                    if (flipDirRef.current !== null) {
                        setFlipDir(null);
                        flipDirRef.current = null;
                    }
                    return;
                }
            }

            if (flipDirRef.current) {
                const rawPrev = lastRawRef.current;

                // Distance from the active corner, normalized
                const dist = flipDirRef.current === "next" ? distBR : distBL;
                const maxDist = Math.hypot(W, H);
                // Map [0, CORNER_RADIUS] → [0, 0.85]
                const raw = Math.min(1 - dist / maxDist, 0.85);

                const rawClamped = Math.max(0, raw);
                lastRawRef.current = rawClamped;

                // Inject the drag as a spring target
                targetRef.current  = rawClamped;
                // Estimate velocity from raw difference
                velocityRef.current = (rawClamped - rawPrev) * 0.5;

                if (phaseRef.current !== "manual") {
                    setPhase("manual");
                    phaseRef.current = "manual";
                    startSpringLoop();
                }
            }
        }
    }, [startSpringLoop]);

    const handleMouseLeave = useCallback(() => {
        if (phaseRef.current !== "manual") return;

        // If user dragged past half — auto-complete the flip
        if (progressRef.current > 0.42 || velocityRef.current > AUTO_FLIP_VELOCITY) {
            lockRef.current = true;
            monthChangedRef.current = false;
            setPhase("flipping");
            phaseRef.current = "flipping";
            targetRef.current = 1;
            velocityRef.current = Math.max(velocityRef.current, 0.02);
            startSpringLoop();
        } else {
            // Snap back
            setPhase("settling");
            phaseRef.current = "settling";
            targetRef.current  = 0;
            velocityRef.current = -Math.abs(velocityRef.current) * 0.5;
            startSpringLoop();
        }
    }, [startSpringLoop]);

    return {
        flip,
        flipDir,
        phase,
        manualProgress,
        containerRef,
        handleMouseMove,
        handleMouseLeave,
    };
}
