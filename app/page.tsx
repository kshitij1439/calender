import { WallCalendar } from "@/components/Calendar";

export default function Home() {
    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-10"
            style={{ background: "#18150f" }}
        >
            <WallCalendar />
        </main>
    );
}
