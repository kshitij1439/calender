"use client";

import { useState, useEffect, useCallback } from "react";
import { Note, DateRange } from "@/types/calendar";
import {
    formatDateKey,
    formatMonthKey,
    normalizeRange,
} from "@/utils/dateUtils";
import { NOTES_STORAGE_KEY } from "@/constants/calendar";

export function useNotes(year: number, month: number, range: DateRange) {
    const [notes, setNotes] = useState<Note[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem(NOTES_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });
    const [input, setInput] = useState("");

    // Persist
    useEffect(() => {
        try {
            localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
        } catch {
            /* ignore */
        }
    }, [notes]);

    const getNoteKey = useCallback((): string => {
        const { start, end } = normalizeRange(range);
        if (start && end)
            return `range:${formatDateKey(start)}:${formatDateKey(end)}`;
        if (start) return `day:${formatDateKey(start)}`;
        return `month:${formatMonthKey(year, month)}`;
    }, [range, year, month]);

    const activeNotes = useCallback(() => {
        const key = getNoteKey();
        return notes.filter((n) => n.key === key);
    }, [notes, getNoteKey]);

    const addNote = useCallback(() => {
        const content = input.trim();
        if (!content) return;
        const note: Note = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            key: getNoteKey(),
            content,
            createdAt: new Date().toISOString(),
        };
        setNotes((prev) => [...prev, note]);
        setInput("");
    }, [input, getNoteKey]);

    const deleteNote = useCallback((id: string) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return {
        notes: activeNotes(),
        input,
        setInput,
        addNote,
        deleteNote,
        getNoteKey,
    };
}
