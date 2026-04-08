"use client";

import { DateRange, SelectionState } from "@/types/calendar";
import { formatRangeLabel, normalizeRange } from "@/utils/dateUtils";

interface RangeStatusBarProps {
    range: DateRange;
    selectionState: SelectionState;
    onClear: () => void;
    accent: string;
}

export function RangeStatusBar({
    range,
    selectionState,
    onClear,
    accent,
}: RangeStatusBarProps) {
    const normalized = normalizeRange(range);

    return (
        <div
            className="flex items-center justify-between min-h-[22px] mb-3"
            style={{ fontSize: "0.7rem", fontFamily: "var(--font-dm-sans)" }}
        >
            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                {selectionState === "selecting" &&
                    !range.end &&
                    "Click another date to set end"}
                {normalized.start && normalized.end && (
                    <span style={{ color: accent }}>
                        📅 {formatRangeLabel(normalized)}
                    </span>
                )}
            </span>

            {(normalized.start || normalized.end) && (
                <button
                    onClick={onClear}
                    className="hover:underline transition-colors"
                    style={{ color: "#d1d5db", fontSize: "0.68rem" }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#d1d5db")
                    }
                >
                    clear
                </button>
            )}
        </div>
    );
}
