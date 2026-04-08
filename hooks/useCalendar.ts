"use client";

import { useState, useCallback, useMemo } from "react";
import { DateRange, SelectionState } from "@/types/calendar";
import {
    buildCalendarGrid,
    isSameDay,
    normalizeRange,
} from "@/utils/dateUtils";

export function useCalendar() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    const [hovered, setHovered] = useState<Date | null>(null);
    const [selectionState, setSelectionState] =
        useState<SelectionState>("idle");
    const [isAnimating, setIsAnimating] = useState(false);
    const [animDir, setAnimDir] = useState<1 | -1>(1);

    const days = useMemo(() => buildCalendarGrid(year, month), [year, month]);

    const goToMonth = useCallback(
        (dir: 1 | -1) => {
            if (isAnimating) return;
            setAnimDir(dir);
            setIsAnimating(true);
            setTimeout(() => {
                setMonth((m) => {
                    const nm = m + dir;
                    if (nm < 0) {
                        setYear((y) => y - 1);
                        return 11;
                    }
                    if (nm > 11) {
                        setYear((y) => y + 1);
                        return 0;
                    }
                    return nm;
                });
                setRange({ start: null, end: null });
                setHovered(null);
                setSelectionState("idle");
                setIsAnimating(false);
            }, 300);
        },
        [isAnimating]
    );

    const handleDayClick = useCallback(
        (date: Date, isCurrentMonth: boolean) => {
            if (!isCurrentMonth) return;

            if (selectionState === "idle") {
                setRange({ start: date, end: null });
                setSelectionState("selecting");
            } else {
                if (isSameDay(date, range.start)) {
                    // Deselect
                    setRange({ start: null, end: null });
                    setSelectionState("idle");
                } else {
                    setRange((r) => ({ ...r, end: date }));
                    setSelectionState("idle");
                }
            }
        },
        [selectionState, range.start]
    );

    const clearRange = useCallback(() => {
        setRange({ start: null, end: null });
        setSelectionState("idle");
        setHovered(null);
    }, []);

    const previewRange: DateRange = useMemo(() => {
        if (selectionState === "selecting" && hovered && range.start) {
            return { start: range.start, end: hovered };
        }
        return range;
    }, [selectionState, hovered, range]);

    const normalizedPreview = useMemo(
        () => normalizeRange(previewRange),
        [previewRange]
    );

    return {
        year,
        month,
        days,
        range,
        previewRange: normalizedPreview,
        selectionState,
        hovered,
        setHovered,
        isAnimating,
        animDir,
        goToMonth,
        handleDayClick,
        clearRange,
    };
}
