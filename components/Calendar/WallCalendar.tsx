"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { MONTH_THEMES } from "@/constants/calendar";
import { useCalendar } from "@/hooks/useCalendar";
import { useNotes } from "@/hooks/useNotes";
import { normalizeRange } from "@/utils/dateUtils";
import { SpiralBinding } from "./SpiralBinding";
import { HeroPage } from "./HeroPage";
import { GridPage } from "./GridPage";
import { NotesPanel } from "./NotesPanel";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const TODAY      = new Date();
const BASE_YEAR  = TODAY.getFullYear() - 2;  // starts 2 years in the past
const YEARS      = 5;
const TOTAL_MONTHS = 12 * YEARS;            // 60 months → 120 pages

function monthIndexToYM(idx: number) {
    return { year: BASE_YEAR + Math.floor(idx / 12), month: idx % 12 };
}

/* ── Component ──────────────────────────────────────────────────────────────── */
export function WallCalendar() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookRef = useRef<any>(null);

    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 880);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Calendar interaction state (date selection lives here)
    const {
        range,
        previewRange,
        selectionState,
        setHovered,
        handleDayClick,
        clearRange,
    } = useCalendar();

    // Track which month spread is currently shown (page-flip driven)
    const initialMonthIdx = (TODAY.getFullYear() - BASE_YEAR) * 12 + TODAY.getMonth();
    const [activeMonthIdx, setActiveMonthIdx] = useState(initialMonthIdx);
    const { year: activeYear, month: activeMonth } = monthIndexToYM(activeMonthIdx);
    const activeTheme = MONTH_THEMES[activeMonth];

    // Notes state
    const { notes, input, setInput, addNote, deleteNote } = useNotes(
        activeYear,
        activeMonth,
        range
    );

    // react-pageflip fires onFlip with the LEFT page index of the new spread
    const handleFlip = useCallback((e: { data: number }) => {
        const monthIdx = Math.floor(e.data / 2);
        setActiveMonthIdx(monthIdx);
    }, []);

    const flipNext = useCallback(() => {
        if (isMobile) {
            setActiveMonthIdx((prev) => Math.min(prev + 1, TOTAL_MONTHS - 1));
        } else {
            bookRef.current?.pageFlip().flipNext("bottom");
        }
    }, [isMobile]);

    const flipPrev = useCallback(() => {
        if (isMobile) {
            setActiveMonthIdx((prev) => Math.max(prev - 1, 0));
        } else {
            bookRef.current?.pageFlip().flipPrev("bottom");
        }
    }, [isMobile]);

    if (isMobile === null) return null; // Avoid hydration mismatch

    /* Build pages for Desktop ------------------------------------------------ */
    const pages: React.ReactElement[] = [];
    if (!isMobile) {
        for (let mi = 0; mi < TOTAL_MONTHS; mi++) {
            const { year: y, month: m } = monthIndexToYM(mi);
            const theme = MONTH_THEMES[m];
            const isActive = mi === activeMonthIdx;

            // Left page — hero photo
            pages.push(
                <HeroPage
                    key={`hero-${mi}`}
                    theme={theme}
                    year={y}
                    onPrev={flipPrev}
                    onNext={flipNext}
                />
            );

            // Right page — calendar grid
            pages.push(
                <GridPage
                    key={`grid-${mi}`}
                    theme={theme}
                    year={y}
                    month={m}
                    range={isActive ? range : { start: null, end: null }}
                    previewRange={isActive ? normalizeRange(previewRange) : { start: null, end: null }}
                    selectionState={isActive ? selectionState : "idle"}
                    onDayClick={isActive ? handleDayClick : () => {}}
                    onDayHover={isActive ? setHovered : () => {}}
                    onDayLeave={isActive ? () => setHovered(null) : () => {}}
                    onClear={isActive ? clearRange : () => {}}
                />
            );
        }
    }

    return (
        <div className="flex flex-col items-center select-none w-full max-w-[840px] mx-auto px-4 sm:px-0">
            {isMobile ? (
                // --- MOBILE LAYOUT ---
                <div className="flex flex-col w-full max-w-[420px] gap-6 pb-12">
                    {/* Navigation Header */}
                    <div className="flex items-center justify-between w-full mt-4">
                        <button
                            onClick={flipPrev}
                            aria-label="Previous month"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all text-white/50 hover:text-white hover:bg-white/10"
                        >
                            ‹
                        </button>
                        <div className="text-center">
                            <span className="text-xs tracking-[0.25em] uppercase block text-white/50 font-dm-sans">
                                {activeYear}
                            </span>
                            <span
                                className="text-2xl font-bold tracking-wide block font-playfair"
                                style={{ color: activeTheme.accent, textShadow: `0 0 10px ${activeTheme.accent}55` }}
                            >
                                {activeTheme.month}
                            </span>
                        </div>
                        <button
                            onClick={flipNext}
                            aria-label="Next month"
                            className="w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all text-white/50 hover:text-white hover:bg-white/10"
                        >
                            ›
                        </button>
                    </div>

                    {/* Hero Image */}
                    <div className="w-full relative rounded-xl shadow-2xl overflow-hidden" style={{ height: "460px" }}>
                        <HeroPage theme={activeTheme} year={activeYear} onPrev={flipPrev} onNext={flipNext} />
                    </div>

                    {/* Calendar Grid */}
                    <div className="w-full relative shadow-2xl overflow-hidden rounded-xl" style={{ height: "460px" }}>
                        <GridPage
                            theme={activeTheme}
                            year={activeYear}
                            month={activeMonth}
                            range={range}
                            previewRange={normalizeRange(previewRange)}
                            selectionState={selectionState}
                            onDayClick={handleDayClick}
                            onDayHover={setHovered}
                            onDayLeave={() => setHovered(null)}
                            onClear={clearRange}
                        />
                    </div>
                </div>
            ) : (
                // --- DESKTOP LAYOUT ---
                <>
                    {/* Metal spiral binding above the book */}
                    <SpiralBinding count={18} />

                    {/* The flip book */}
                    <div
                        className="rounded-b-xl overflow-visible relative"
                        style={{
                            boxShadow: "0 30px 70px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                    >
                        <HTMLFlipBook
                            ref={bookRef}
                            width={420}
                            height={560}
                            size="fixed"
                            minWidth={280}
                            maxWidth={520}
                            minHeight={380}
                            maxHeight={680}
                            drawShadow={true}
                            flippingTime={850}
                            usePortrait={false}
                            startZIndex={5}
                            autoSize={false}
                            showCover={false}
                            mobileScrollSupport={false}
                            startPage={activeMonthIdx * 2}
                            onFlip={handleFlip}
                            className="wall-calendar-book"
                            style={{}}
                            swipeDistance={40}
                            showPageCorners={true}
                            disableFlipByClick={false}
                            maxShadowOpacity={0.45}
                            clickEventForward={true}
                            useMouseEvents={true}
                        >
                            {pages}
                        </HTMLFlipBook>
                    </div>

                    {/* Navigation bar beneath */}
                    <div className="mt-5 flex items-center justify-center gap-4 w-full">
                        <button
                            onClick={flipPrev}
                            aria-label="Previous month"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.55)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                            }}
                        >
                            ‹
                        </button>

                        <div className="text-center" style={{ minWidth: "180px" }}>
                            <span
                                className="text-xs tracking-[0.25em] uppercase block"
                                style={{
                                    color: "rgba(255,255,255,0.38)",
                                    fontFamily: "var(--font-dm-sans)",
                                }}
                            >
                                {activeYear}
                            </span>
                            <span
                                className="text-lg font-bold tracking-wide block"
                                style={{
                                    color: activeTheme.accent,
                                    fontFamily: "var(--font-playfair)",
                                    textShadow: `0 0 20px ${activeTheme.accent}55`,
                                }}
                            >
                                {activeTheme.month}
                            </span>
                        </div>

                        <button
                            onClick={flipNext}
                            aria-label="Next month"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.55)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                            }}
                        >
                            ›
                        </button>
                    </div>
                </>
            )}

            {/* Notes Section - rendered identically for Mobile and Desktop at the bottom */}
            <div className={`w-full max-w-[420px] lg:max-w-[840px] mx-auto bg-[#fafaf9] rounded-xl shadow-2xl p-5 ${isMobile ? "mt-2" : "mt-8"}`}>
                <NotesPanel
                    notes={notes}
                    input={input}
                    setInput={setInput}
                    addNote={addNote}
                    deleteNote={deleteNote}
                    range={range}
                    year={activeYear}
                    month={activeMonth}
                    accent={activeTheme.accent}
                />
            </div>
        </div>
    );
}
