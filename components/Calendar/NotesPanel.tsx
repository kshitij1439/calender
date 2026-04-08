"use client";

import { Note, DateRange } from "@/types/calendar";
import { formatRangeLabel } from "@/utils/dateUtils";
import { MONTH_THEMES } from "@/constants/calendar";

interface NotesPanelProps {
    notes: Note[];
    input: string;
    setInput: (v: string) => void;
    addNote: () => void;
    deleteNote: (id: string) => void;
    range: DateRange;
    year: number;
    month: number;
    accent: string;
}

export function NotesPanel({
    notes,
    input,
    setInput,
    addNote,
    deleteNote,
    range,
    year,
    month,
    accent,
}: NotesPanelProps) {
    const theme = MONTH_THEMES[month];
    const label = range.start
        ? formatRangeLabel(range)
        : `${theme.month} ${year}`;

    return (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span
                    className="tracking-[3px] uppercase"
                    style={{
                        fontSize: "0.62rem",
                        color: "#9ca3af",
                        fontFamily: "var(--font-dm-sans)",
                        fontWeight: 500,
                    }}
                >
                    Notes
                </span>
                <span
                    style={{
                        fontSize: "0.68rem",
                        color: accent,
                        fontFamily: "var(--font-dm-sans)",
                    }}
                >
                    {label}
                </span>
            </div>

            {/* Existing notes */}
            {notes.length > 0 && (
                <div className="mb-3 space-y-1.5 max-h-[80px] overflow-y-auto pr-1">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className="flex items-start gap-2 group"
                        >
                            <div
                                className="flex-1 text-[0.75rem] italic px-2 py-1 rounded-r"
                                style={{
                                    borderLeft: `3px solid ${accent}`,
                                    background: theme.accentLight,
                                    color: "#374151",
                                    fontFamily: "var(--font-dm-sans)",
                                    lineHeight: "1.4",
                                }}
                            >
                                {note.content}
                            </div>
                            <button
                                onClick={() => deleteNote(note.id)}
                                aria-label="Delete note"
                                className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm mt-0.5 leading-none"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addNote()}
                    placeholder="Add a note…"
                    className="flex-1 text-[0.78rem] px-3 py-2 rounded border outline-none transition-colors"
                    style={{
                        borderColor: "#e5e7eb",
                        background: "#fafaf9",
                        fontFamily: "var(--font-dm-sans)",
                        color: "#374151",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = accent)}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                    onClick={addNote}
                    className="px-4 py-2 text-[0.72rem] font-medium tracking-wide text-white rounded transition-opacity hover:opacity-85"
                    style={{
                        background: accent,
                        fontFamily: "var(--font-dm-sans)",
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    );
}
