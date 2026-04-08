"use client";

import React, { useMemo } from "react";
import { MonthTheme, DateRange, SelectionState, Note } from "@/types/calendar";
import { CalendarGrid } from "./CalendarGrid";
import { RangeStatusBar } from "./RangeStatusBar";
import { buildCalendarGrid } from "@/utils/dateUtils";
import { NotesPanel } from "./NotesPanel";

interface GridPageProps {
    theme: MonthTheme;
    year: number;
    month: number; // 0-11
    range: DateRange;
    previewRange: DateRange;
    selectionState: SelectionState;
    onDayClick: (date: Date, isCurrentMonth: boolean) => void;
    onDayHover: (date: Date) => void;
    onDayLeave: () => void;
    onClear: () => void;
    notesProps?: {
        notes: Note[];
        input: string;
        setInput: (v: string) => void;
        addNote: () => void;
        deleteNote: (id: string) => void;
    } | null;
}

export const GridPage = React.forwardRef<HTMLDivElement, GridPageProps>(
    (
        {
            theme,
            year,
            month,
            range,
            previewRange,
            selectionState,
            onDayClick,
            onDayHover,
            onDayLeave,
            onClear,
            notesProps,
        },
        ref
    ) => {
        const days = useMemo(() => buildCalendarGrid(year, month), [year, month]);

        return (
            <div ref={ref} className="page grid-page" style={{ overflow: "hidden" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        background: "#f6f3ed",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                    }}
                >
                {/* Top accent bar */}
                <div
                    className="w-full h-[4px] flex-shrink-0"
                    style={{ background: theme.accent }}
                />

                <div className="flex-1 flex flex-col px-6 pt-5 pb-4 overflow-hidden">
                    {/* Month header on the grid side */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <h3
                            className="text-base font-semibold tracking-tight"
                            style={{
                                color: theme.accent,
                                fontFamily: "var(--font-playfair)",
                            }}
                        >
                            {theme.month}
                            <span
                                className="ml-2 text-xs font-light"
                                style={{
                                    color: "#9ca3af",
                                    fontFamily: "var(--font-dm-sans)",
                                }}
                            >
                                {year}
                            </span>
                        </h3>
                    </div>

                    <RangeStatusBar
                        range={range}
                        selectionState={selectionState}
                        onClear={onClear}
                        accent={theme.accent}
                    />

                    <CalendarGrid
                        days={days}
                        range={previewRange}
                        accent={theme.accent}
                        accentLight={theme.accentLight}
                        onDayClick={onDayClick}
                        onDayHover={onDayHover}
                        onDayLeave={onDayLeave}
                    />

                    {notesProps && (
                        <NotesPanel
                            notes={notesProps.notes}
                            input={notesProps.input}
                            setInput={notesProps.setInput}
                            addNote={notesProps.addNote}
                            deleteNote={notesProps.deleteNote}
                            range={range}
                            year={year}
                            month={month}
                            accent={theme.accent}
                        />
                    )}
                </div>
                </div>
            </div>
        );
    }
);

GridPage.displayName = "GridPage";
