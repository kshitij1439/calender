export interface MonthTheme {
    id: number;
    month: string;
    shortMonth: string;
    imagePath: string;
    accent: string;
    accentLight: string;
    sceneName: string;
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface Note {
    id: string;
    key: string; // "YYYY-MM-DD" or "YYYY-MM"
    content: string;
    createdAt: string;
}

export interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
}

export type SelectionState = "idle" | "selecting";
