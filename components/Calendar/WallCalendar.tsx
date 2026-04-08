"use client";

import { useCallback } from "react";
import { MONTH_THEMES } from "@/constants/calendar";
import { useCalendar } from "@/hooks/useCalendar";
import { useNotes } from "@/hooks/useNotes";
import { usePageFlip } from "@/hooks/usePageFlip";
import { SpiralBinding } from "./SpiralBinding";
import { HeroPanel } from "./HeroPanel";
import { CalendarGrid } from "./CalendarGrid";
import { RangeStatusBar } from "./RangeStatusBar";
import { NotesPanel } from "./NotesPanel";
import { PageFlip } from "./PageFlip";

export function WallCalendar() {
    const {
        year,
        month,
        days,
        range,
        previewRange,
        selectionState,
        setHovered,
        goToMonth,
        handleDayClick,
        clearRange,
    } = useCalendar();

    const theme = MONTH_THEMES[month];
    const { notes, input, setInput, addNote, deleteNote } = useNotes(
        year,
        month,
        range
    );

    const handleMonthChange = useCallback(
        (dir: 1 | -1) => {
            goToMonth(dir);
        },
        [goToMonth]
    );

    const { flip, flipDir, phase } = usePageFlip({
        onMonthChange: handleMonthChange,
    });

    return (
        <div className="w-full max-w-[860px] mx-auto select-none">
            {/* Spiral binding — the hinge */}
            <SpiralBinding count={16} />

            <div
                className="flex flex-col md:flex-row overflow-visible rounded-b-xl"
                style={{
                    filter: "drop-shadow(0 32px 60px rgba(0,0,0,0.6)) drop-shadow(0 4px 16px rgba(0,0,0,0.35))",
                }}
            >
                {/* LEFT: Hero image stays — photo doesn't flip, only the date sheet does */}
                <HeroPanel
                    theme={theme}
                    year={year}
                    onPrev={() => flip("prev")}
                    onNext={() => flip("next")}
                />

                {/* RIGHT: Calendar sheet — this physically flips */}
                <div
                    className="flex-1 min-w-0 rounded-b-xl md:rounded-bl-none md:rounded-br-xl overflow-hidden"
                    style={{ background: "#f9f8f6" }}
                >
                    <PageFlip flipDir={flipDir} phase={phase}>
                        <div className="flex flex-col px-6 pt-6 pb-5 bg-[#f9f8f6]">
                            <RangeStatusBar
                                range={range}
                                selectionState={selectionState}
                                onClear={clearRange}
                                accent={theme.accent}
                            />
                            <CalendarGrid
                                days={days}
                                range={previewRange}
                                accent={theme.accent}
                                accentLight={theme.accentLight}
                                onDayClick={handleDayClick}
                                onDayHover={setHovered}
                                onDayLeave={() => setHovered(null)}
                            />
                            <NotesPanel
                                notes={notes}
                                input={input}
                                setInput={setInput}
                                addNote={addNote}
                                deleteNote={deleteNote}
                                range={range}
                                year={year}
                                month={month}
                                accent={theme.accent}
                            />
                        </div>
                    </PageFlip>
                </div>
            </div>
        </div>
    );
}
