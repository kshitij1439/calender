"use client";

import { CalendarDay, DateRange } from "@/types/calendar";
import { DayCell } from "./DayCell";
import { WEEKDAYS } from "@/constants/calendar";

interface CalendarGridProps {
    days: CalendarDay[];
    range: DateRange;
    accent: string;
    accentLight: string;
    onDayClick: (date: Date, isCurrentMonth: boolean) => void;
    onDayHover: (date: Date) => void;
    onDayLeave: () => void;
}

export function CalendarGrid({
    days,
    range,
    accent,
    accentLight,
    onDayClick,
    onDayHover,
    onDayLeave,
}: CalendarGridProps) {
    return (
        <div className="flex-1">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((day, i) => (
                    <div
                        key={day}
                        className="text-center py-1"
                        style={{
                            fontSize: "0.62rem",
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            fontWeight: 500,
                            color: i >= 5 ? "#b45309" : "#9ca3af",
                            fontFamily: "var(--font-dm-sans)",
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
                {days.map((day, idx) => (
                    <DayCell
                        key={day.date.toISOString()}
                        day={day}
                        range={range}
                        accent={accent}
                        accentLight={accentLight}
                        colIndex={idx % 7}
                        onClick={onDayClick}
                        onMouseEnter={onDayHover}
                        onMouseLeave={onDayLeave}
                    />
                ))}
            </div>
        </div>
    );
}
