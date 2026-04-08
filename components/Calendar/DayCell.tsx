"use client";

import { CalendarDay, DateRange } from "@/types/calendar";
import { isSameDay, isInRange } from "@/utils/dateUtils";

interface DayCellProps {
    day: CalendarDay;
    range: DateRange;
    accent: string;
    accentLight: string;
    colIndex: number; // 0–6 within the row
    onClick: (date: Date, isCurrentMonth: boolean) => void;
    onMouseEnter: (date: Date) => void;
    onMouseLeave: () => void;
}

export function DayCell({
    day,
    range,
    accent,
    accentLight,
    colIndex,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: DayCellProps) {
    const { date, dayOfMonth, isCurrentMonth, isToday, isWeekend } = day;
    const { start, end } = range;

    const isStart = isSameDay(date, start);
    const isEnd = end ? isSameDay(date, end) : false;
    const isSelected = isStart || isEnd;
    const inRange = isInRange(date, range);

    // Row-edge detection for range capsule
    const isFirstInRow = colIndex === 0;
    const isLastInRow = colIndex === 6;
    const isRangeEdge = isStart || isEnd;

    let bg = "transparent";
    let color = isCurrentMonth
        ? isWeekend
            ? "#b45309"
            : "#1a1a1a"
        : "#d4d4d4";
    let fontWeight = isToday ? "700" : "400";
    let borderRadius = "50%";

    if (isSelected) {
        bg = accent;
        color = "#fff";
        fontWeight = "600";
    } else if (inRange) {
        bg = accentLight;
        color = accent;
        // Capsule shape through the row
        if (isFirstInRow) {
            borderRadius = "50% 0 0 50%";
        } else if (isLastInRow) {
            borderRadius = "0 50% 50% 0";
        } else {
            borderRadius = "0";
        }
    }

    return (
        <div
            role="button"
            tabIndex={isCurrentMonth ? 0 : -1}
            aria-label={date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}
            aria-pressed={isSelected}
            onClick={() => onClick(date, isCurrentMonth)}
            onMouseEnter={() => isCurrentMonth && onMouseEnter(date)}
            onMouseLeave={onMouseLeave}
            onKeyDown={(e) =>
                e.key === "Enter" && onClick(date, isCurrentMonth)
            }
            className="relative flex items-center justify-center select-none"
            style={{
                height: "36px",
                cursor: isCurrentMonth ? "pointer" : "default",
                opacity: isCurrentMonth ? 1 : 0.35,
                pointerEvents: isCurrentMonth ? "auto" : "none",
            }}
        >
            {/* Range background strip — spans full cell width */}
            {(inRange || isRangeEdge) && (
                <span
                    aria-hidden
                    className="absolute inset-y-[4px]"
                    style={{
                        left: isStart || isFirstInRow ? "50%" : "0",
                        right: isEnd || isLastInRow ? "50%" : "0",
                        background: accentLight,
                        zIndex: 0,
                        ...(inRange
                            ? {
                                  left: isFirstInRow ? "50%" : "0",
                                  right: isLastInRow ? "50%" : "0",
                              }
                            : {}),
                        ...(isStart && end ? { left: "50%", right: "0" } : {}),
                        ...(isEnd && start ? { left: "0", right: "50%" } : {}),
                    }}
                />
            )}

            {/* Day circle */}
            <span
                className="relative z-10 flex items-center justify-center w-8 h-8 text-sm transition-all duration-150"
                style={{
                    background: bg,
                    color,
                    fontWeight,
                    borderRadius: "50%",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.82rem",
                }}
            >
                {dayOfMonth}
                {/* Today dot */}
                {isToday && !isSelected && (
                    <span
                        className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: accent }}
                    />
                )}
            </span>
        </div>
    );
}
