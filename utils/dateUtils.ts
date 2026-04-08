import { CalendarDay, DateRange } from "@/types/calendar";

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/** Returns 0=Mon … 6=Sun */
export function getFirstWeekdayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function isInRange(date: Date, range: DateRange): boolean {
    const { start, end } = range;
    if (!start || !end) return false;
    const s = start <= end ? start : end;
    const e = start <= end ? end : start;
    return date > s && date < e;
}

export function normalizeRange(range: DateRange): DateRange {
    if (!range.start || !range.end) return range;
    return range.start <= range.end
        ? range
        : { start: range.end, end: range.start };
}

export function buildCalendarGrid(year: number, month: number): CalendarDay[] {
    const today = new Date();
    const totalDays = getDaysInMonth(year, month);
    const firstOffset = getFirstWeekdayOfMonth(year, month);

    const days: CalendarDay[] = [];

    // Leading days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevTotal = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstOffset - 1; i >= 0; i--) {
        const date = new Date(prevYear, prevMonth, prevTotal - i);
        days.push({
            date,
            dayOfMonth: prevTotal - i,
            isCurrentMonth: false,
            isToday: false,
            isWeekend: isWeekendDate(date),
        });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
        const date = new Date(year, month, d);
        days.push({
            date,
            dayOfMonth: d,
            isCurrentMonth: true,
            isToday: isSameDay(date, today),
            isWeekend: isWeekendDate(date),
        });
    }

    // Trailing days — fill to complete last row
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    let trailing = 1;
    while (days.length % 7 !== 0) {
        const date = new Date(nextYear, nextMonth, trailing++);
        days.push({
            date,
            dayOfMonth: date.getDate(),
            isCurrentMonth: false,
            isToday: false,
            isWeekend: isWeekendDate(date),
        });
    }

    return days;
}

function isWeekendDate(date: Date): boolean {
    const d = date.getDay();
    return d === 0 || d === 6;
}

export function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatMonthKey(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function formatRangeLabel(range: DateRange): string {
    const { start, end } = normalizeRange(range);
    if (!start) return "";
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (!end) return start.toLocaleDateString("en-US", opts);
    return `${start.toLocaleDateString(
        "en-US",
        opts
    )} – ${end.toLocaleDateString("en-US", opts)}`;
}
