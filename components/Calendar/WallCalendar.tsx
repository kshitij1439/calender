"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
import React from "react";
import HTMLFlipBook from "react-pageflip";
import { MONTH_THEMES } from "@/constants/calendar";
import { useCalendar } from "@/hooks/useCalendar";
import { useNotes } from "@/hooks/useNotes";
import { normalizeRange } from "@/utils/dateUtils";
import { SpiralBinding } from "./SpiralBinding";
import { HeroPage } from "./HeroPage";
import { GridPage } from "./GridPage";

/* ── Constants ─────────────────────────────────────────────────────────────── */
const TODAY = new Date();
const BASE_YEAR = TODAY.getFullYear() - 2;
const YEARS = 5;
const TOTAL_MONTHS = 12 * YEARS;

function monthIndexToYM(idx: number) {
    return { year: BASE_YEAR + Math.floor(idx / 12), month: idx % 12 };
}

/* ── SpreadPage: forwardRef wrapper required by react-pageflip ── */
interface SpreadPageProps { children: React.ReactNode; style?: React.CSSProperties; }
const SpreadPage = React.forwardRef<HTMLDivElement, SpreadPageProps>(
    ({ children, style }, ref) => (
        <div ref={ref} style={{ overflow: "hidden", ...style }}>{children}</div>
    )
);
SpreadPage.displayName = "SpreadPage";

/* ── Static props passed into PageContent via useMemo ── */
const EMPTY_RANGE = { start: null, end: null } as const;
const NOOP = () => { };
const NOOP_DAY = (_d: Date, _c: boolean) => { };
const NOOP_STR = (_v: string) => { };

/* ──────────────────────────────────────────────────────────────────────────────
 *  PageContent
 *
 *  Rendered inside each SpreadPage. Receives only STATIC props so that the
 *  useMemo pages array never rebuilds on interactive state changes.
 *  All live calendar state is accessed via liveRef callbacks at event time.
 * ────────────────────────────────────────────────────────────────────────────── */
interface PageContentProps {
    year: number;
    month: number;
    layout: "portrait" | "landscape";
    pageW: number;
    pageH: number;
    heroH: number;
    gridH: number;
    isActive: boolean;
    range: ReturnType<typeof useCalendar>["range"];
    previewRange: ReturnType<typeof useCalendar>["previewRange"];
    selectionState: ReturnType<typeof useCalendar>["selectionState"];
    setHovered: ReturnType<typeof useCalendar>["setHovered"];
    handleDayClick: (date: Date, isCurrentMonth: boolean) => void;
    clearRange: ReturnType<typeof useCalendar>["clearRange"];
    notes: ReturnType<typeof useNotes>["notes"];
    input: string;
    setInput: (v: string) => void;
    addNote: ReturnType<typeof useNotes>["addNote"];
    deleteNote: ReturnType<typeof useNotes>["deleteNote"];
    onPrev: () => void;
    onNext: () => void;
}

function PageContent({
    year, month, layout, pageW, pageH, heroH, gridH,
    isActive,
    range, previewRange, selectionState,
    setHovered, handleDayClick, clearRange,
    notes, input, setInput, addNote, deleteNote,
    onPrev, onNext,
}: PageContentProps) {
    const theme = MONTH_THEMES[month];
    const activeRange = isActive ? range : EMPTY_RANGE;
    const activePreview = isActive ? normalizeRange(previewRange) : EMPTY_RANGE;
    const activeState = isActive ? selectionState : "idle";

    if (layout === "portrait") {
        return (
            <div style={{ display: "flex", flexDirection: "column", width: pageW, height: pageH }}>
                <div style={{ height: heroH, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    <HeroPage theme={theme} year={year} onPrev={onPrev} onNext={onNext} />
                </div>
                <div style={{ height: gridH, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    <GridPage
                        theme={theme} year={year} month={month}
                        range={activeRange}
                        previewRange={activePreview}
                        selectionState={activeState}
                        onDayClick={isActive ? handleDayClick : NOOP_DAY}
                        onDayHover={isActive ? setHovered : NOOP}
                        onDayLeave={isActive ? () => setHovered(null) : NOOP}
                        onClear={isActive ? clearRange : NOOP}
                        notesProps={isActive ? { notes, input, setInput, addNote, deleteNote } : null}
                    />
                </div>
            </div>
        );
    }

    /* landscape — side-by-side */
    return (
        <div style={{ display: "flex", flexDirection: "row", width: pageW, height: pageH }}>
            <div style={{ width: pageW / 2, height: pageH, flexShrink: 0, position: "relative" }}>
                <HeroPage theme={theme} year={year} onPrev={onPrev} onNext={onNext} />
            </div>
            <div style={{ width: pageW / 2, height: pageH, flexShrink: 0, position: "relative" }}>
                <GridPage
                    theme={theme} year={year} month={month}
                    range={activeRange}
                    previewRange={activePreview}
                    selectionState={activeState}
                    onDayClick={isActive ? handleDayClick : NOOP_DAY}
                    onDayHover={isActive ? setHovered : NOOP}
                    onDayLeave={isActive ? () => setHovered(null) : NOOP}
                    onClear={isActive ? clearRange : NOOP}
                    notesProps={isActive ? { notes, input, setInput, addNote, deleteNote } : null}
                />
            </div>
        </div>
    );
}

/* ── Main WallCalendar ──────────────────────────────────────────────────────── */
export function WallCalendar() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookRef = useRef<any>(null);

    // null until mounted — prevents hydration mismatch
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [bookWidth, setBookWidth] = useState<number>(390);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 880;
            setIsMobile(mobile);
            if (mobile) setBookWidth(Math.min(window.innerWidth, 420));
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const {
        range, previewRange, selectionState,
        setHovered, handleDayClick, clearRange,
    } = useCalendar();

    const initialMonthIdx = (TODAY.getFullYear() - BASE_YEAR) * 12 + TODAY.getMonth();
    const [activeMonthIdx, setActiveMonthIdx] = useState(initialMonthIdx);
    const { year: activeYear, month: activeMonth } = monthIndexToYM(activeMonthIdx);
    const activeTheme = MONTH_THEMES[activeMonth];

    const { notes, input, setInput, addNote, deleteNote } = useNotes(
        activeYear, activeMonth, range
    );

    const handleFlip = useCallback((e: { data: number }) => {
        setActiveMonthIdx(e.data);
    }, []);

    const flipNext = useCallback(() => bookRef.current?.pageFlip().flipNext("bottom"), []);
    const flipPrev = useCallback(() => bookRef.current?.pageFlip().flipPrev("bottom"), []);

    /* ── Layout constants — derived from state, default gracefully when isMobile is null ── */
    const layout = isMobile ? "portrait" : "landscape";
    const pageW = isMobile ? bookWidth : 840;
    const pageH = isMobile ? 680 : 560;
    const heroH = isMobile ? 220 : pageH;
    const gridH = isMobile ? 460 : pageH;

    /* ──────────────────────────────────────────────────────────────────────────
     *  liveRef — holds the latest interactive state.
     *
     *  PageContent callbacks close over this ref so they always read fresh
     *  values at call time, without the pages array needing to rebuild.
     *
     *  IMPORTANT: declared BEFORE the early return to satisfy Rules of Hooks.
     * ────────────────────────────────────────────────────────────────────────── */
    const liveRef = useRef({
        activeMonthIdx,
        range, previewRange, selectionState,
        setHovered, handleDayClick, clearRange,
        notes, input, setInput, addNote, deleteNote,
    });
    liveRef.current = {
        activeMonthIdx,
        range, previewRange, selectionState,
        setHovered, handleDayClick, clearRange,
        notes, input, setInput, addNote, deleteNote,
    };

    /* ──────────────────────────────────────────────────────────────────────────
     *  pages — STABLE array via useMemo.
     *
     *  Only rebuilds when layout geometry changes (which also triggers a full
     *  flipbook remount via `key`). Never rebuilds on calendar state changes.
     *
     *  All interactive callbacks delegate to liveRef so they stay correct
     *  without causing the array to rebuild.
     *
     *  IMPORTANT: declared BEFORE the early return to satisfy Rules of Hooks.
     * ────────────────────────────────────────────────────────────────────────── */
    const pages = useMemo(() => {
        const arr: React.ReactElement[] = [];
        for (let mi = 0; mi < TOTAL_MONTHS; mi++) {
            const { year: y, month: m } = monthIndexToYM(mi);
            const capturedMi = mi;

            arr.push(
                <SpreadPage
                    key={`page-${capturedMi}`}
                    style={{ width: pageW, height: pageH }}
                >
                    <PageContent
                        year={y}
                        month={m}
                        layout={layout}
                        pageW={pageW}
                        pageH={pageH}
                        heroH={heroH}
                        gridH={gridH}
                        /* Static — active state is handled via liveRef callbacks */
                        isActive={false}
                        range={EMPTY_RANGE}
                        previewRange={EMPTY_RANGE}
                        selectionState="idle"
                        notes={[]}
                        input=""
                        setInput={NOOP_STR}
                        addNote={NOOP}
                        deleteNote={NOOP}
                        /* Callbacks read liveRef at call time — always fresh */
                        setHovered={(d) => liveRef.current.setHovered(d)}
                        handleDayClick={(d, isCurrentMonth) => {
                            if (capturedMi === liveRef.current.activeMonthIdx)
                                liveRef.current.handleDayClick(d, isCurrentMonth);
                        }}
                        clearRange={() => {
                            if (capturedMi === liveRef.current.activeMonthIdx)
                                liveRef.current.clearRange();
                        }}
                        onPrev={flipPrev}
                        onNext={flipNext}
                    />
                </SpreadPage>
            );
        }
        return arr;
        // pageW/pageH/heroH/gridH/layout change together and are all derived from
        // isMobile + bookWidth, so listing them covers all resize cases.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layout, pageW, pageH, heroH, gridH]);

    /* ── Early return AFTER all hooks — acts as a render gate only ── */
    if (isMobile === null) return null;

    /* ── flipbook key forces full remount when layout geometry changes ── */
    const flipbookKey = `${isMobile ? "m" : "d"}-${bookWidth}`;

    /* ── Shared flipbook props ── */
    const commonProps = {
        ref: bookRef,
        drawShadow: true,
        usePortrait: true,
        startZIndex: 5,
        autoSize: false,
        showCover: false,
        mobileScrollSupport: false,
        startPage: initialMonthIdx,
        onFlip: handleFlip,
        className: "wall-calendar-book",
        style: {} as React.CSSProperties,
        showPageCorners: true,
        disableFlipByClick: true,
        clickEventForward: false,
        useMouseEvents: true,
    };

    return (
        <div className="flex flex-col items-center select-none w-full mx-auto">
            {isMobile ? (
                <div className="flex flex-col items-center w-full pb-12">
                    <SpiralBinding count={12} />
                    <div
                        className="rounded-b-xl overflow-visible relative"
                        style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                    >
                        <HTMLFlipBook
                            key={flipbookKey}
                            {...commonProps}
                            width={bookWidth}
                            height={680}
                            size="fixed"
                            minWidth={280}
                            maxWidth={420}
                            minHeight={500}
                            maxHeight={780}
                            flippingTime={750}
                            swipeDistance={30}
                            maxShadowOpacity={0.4}
                        >
                            {pages}
                        </HTMLFlipBook>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-4 w-full">
                        <NavButton onClick={flipPrev} label="‹" ariaLabel="Previous month" />
                        <div className="text-center" style={{ minWidth: "160px" }}>
                            <span className="text-xs tracking-[0.25em] uppercase block"
                                style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-dm-sans)" }}>
                                {activeYear}
                            </span>
                            <span className="text-lg font-bold tracking-wide block"
                                style={{ color: activeTheme.accent, fontFamily: "var(--font-playfair)", textShadow: `0 0 20px ${activeTheme.accent}55` }}>
                                {activeTheme.month}
                            </span>
                        </div>
                        <NavButton onClick={flipNext} label="›" ariaLabel="Next month" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full max-w-[840px]">
                    <SpiralBinding count={18} />
                    <div
                        className="rounded-b-xl overflow-visible relative"
                        style={{ boxShadow: "0 30px 70px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}
                    >
                        <HTMLFlipBook
                            key={flipbookKey}
                            {...commonProps}
                            width={840}
                            height={560}
                            size="fixed"
                            minWidth={560}
                            maxWidth={840}
                            minHeight={380}
                            maxHeight={680}
                            flippingTime={850}
                            swipeDistance={40}
                            maxShadowOpacity={0.45}
                        >
                            {pages}
                        </HTMLFlipBook>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-4 w-full">
                        <NavButton onClick={flipPrev} label="‹" ariaLabel="Previous month" />
                        <div className="text-center" style={{ minWidth: "180px" }}>
                            <span className="text-xs tracking-[0.25em] uppercase block"
                                style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-dm-sans)" }}>
                                {activeYear}
                            </span>
                            <span className="text-lg font-bold tracking-wide block"
                                style={{ color: activeTheme.accent, fontFamily: "var(--font-playfair)", textShadow: `0 0 20px ${activeTheme.accent}55` }}>
                                {activeTheme.month}
                            </span>
                        </div>
                        <NavButton onClick={flipNext} label="›" ariaLabel="Next month" />
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Small reusable nav button ── */
function NavButton({ onClick, label, ariaLabel }: { onClick: () => void; label: string; ariaLabel: string }) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.16)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
        >
            {label}
        </button>
    );
}
