"use client";

import { useEffect, useRef } from "react";
import { FlipDirection, FlipPhase } from "@/hooks/usePageFlip";

interface PageFlipProps {
    flipDir: FlipDirection;
    phase: FlipPhase;
    manualProgress: number;
    children: React.ReactNode;
    nextChildren?: React.ReactNode;
}

// ─── Geometry helpers ────────────────────────────────────────────────────────
type Pt = { x: number; y: number };

function side(px: number, py: number, a: Pt, b: Pt) {
    return Math.sign((b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x));
}
function reflectPt(px: number, py: number, a: Pt, b: Pt): Pt {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy);
    return { x: 2 * (a.x + t * dx) - px, y: 2 * (a.y + t * dy) - py };
}
function sortCCW(pts: Pt[]): Pt[] {
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return [...pts].sort(
        (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
    );
}
function lineIntersect(p1: Pt, p2: Pt, p3: Pt, p4: Pt): Pt | null {
    const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
    const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
    const den = d1x * d2y - d1y * d2x;
    if (Math.abs(den) < 1e-10) return null;
    const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
    const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / den;
    return u >= 0 && u <= 1 ? { x: p1.x + t * d1x, y: p1.y + t * d1y } : null;
}
function edgeIntersections(a: Pt, b: Pt, W: number, H: number): Pt[] {
    const edges: [Pt, Pt][] = [
        [{ x: 0, y: 0 }, { x: W, y: 0 }],
        [{ x: W, y: 0 }, { x: W, y: H }],
        [{ x: W, y: H }, { x: 0, y: H }],
        [{ x: 0, y: H }, { x: 0, y: 0 }],
    ];
    return edges.reduce<Pt[]>((acc, [e1, e2]) => {
        const p = lineIntersect(a, b, e1, e2);
        if (p) acc.push(p);
        return acc;
    }, []);
}

// ─── Paper grain (generated once) ───────────────────────────────────────────
let _grainCanvas: HTMLCanvasElement | null = null;
function getGrain(): HTMLCanvasElement {
    if (_grainCanvas) return _grainCanvas;
    const c = document.createElement("canvas");
    c.width = 200; c.height = 200;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(200, 200);
    for (let i = 0; i < img.data.length; i += 4) {
        const v = 215 + Math.random() * 40;
        img.data[i] = v; img.data[i+1] = v - 6; img.data[i+2] = v - 14; img.data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    _grainCanvas = c;
    return c;
}

// ─── Core draw ───────────────────────────────────────────────────────────────
function drawPageCurl(
    ctx: CanvasRenderingContext2D,
    W: number, H: number,
    progress: number,
    dir: "next" | "prev"
) {
    ctx.clearRect(0, 0, W, H);
    if (progress < 0.001) return;

    // Corner C (origin of peel) and target D
    const cX = dir === "next" ? W : 0;
    const cY = H;
    const dX = dir === "next" ? 0 : W;
    const dY = 0;

    // Current tip of the lifted corner
    const pX = cX + (dX - cX) * progress;
    const pY = cY + (dY - cY) * progress;

    // Fold line: perp bisector of C→P
    const midX = (cX + pX) / 2, midY = (cY + pY) / 2;
    const vx = pX - cX, vy = pY - cY;
    const len = Math.sqrt(vx * vx + vy * vy) || 1;
    const nx = -vy / len, ny = vx / len;

    const ext = Math.max(W, H) * 2.5;
    const hits = edgeIntersections(
        { x: midX - nx * ext, y: midY - ny * ext },
        { x: midX + nx * ext, y: midY + ny * ext },
        W, H
    );
    const [f1, f2] = hits.length >= 2
        ? [hits[0], hits[1]]
        : [{ x: cX, y: 0 }, { x: cX, y: H }];

    const cSide = side(cX, cY, f1, f2);
    const corners = [
        { x: 0, y: 0 }, { x: W, y: 0 },
        { x: W, y: H }, { x: 0, y: H },
    ];

    const sDir = dir === "next" ? -1 : 1;
    const peakSin = Math.sin(progress * Math.PI);

    // ── 1. Flat face (static page beneath lifting portion) ─────────────────
    const flatPts = sortCCW([
        f1, f2, ...corners.filter(c => side(c.x, c.y, f1, f2) === cSide),
    ]);
    ctx.save();
    ctx.beginPath();
    flatPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();

    // Paper color
    ctx.fillStyle = "#f2ede6";
    ctx.fill();
    // Grain overlay
    const grain = getGrain();
    const pat = ctx.createPattern(grain, "repeat");
    if (pat) { ctx.fillStyle = pat; ctx.globalAlpha = 0.18; ctx.fill(); ctx.globalAlpha = 1; }

    // Cast shadow from the lifted portion onto flat face
    const sShadow = ctx.createLinearGradient(
        f1.x, f1.y,
        f1.x + nx * sDir * 130, f1.y + ny * sDir * 130
    );
    sShadow.addColorStop(0,   `rgba(0,0,0,${peakSin * 0.5})`);
    sShadow.addColorStop(0.5, `rgba(0,0,0,${peakSin * 0.15})`);
    sShadow.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = sShadow;
    ctx.fill();
    ctx.restore();

    // ── 2. Reflected / back of page ────────────────────────────────────────
    const r = reflectPt(cX, cY, f1, f2);
    const curve = 60 * peakSin;
    const cs = dir === "next" ? 1 : -1;

    // Two control points for the bezier fold edge
    const cp1x = f1.x + (f2.x - f1.x) * 0.3 + nx * curve * cs;
    const cp1y = f1.y + (f2.y - f1.y) * 0.3 + ny * curve * cs;
    const cp2x = f1.x + (f2.x - f1.x) * 0.7 + nx * curve * cs;
    const cp2y = f1.y + (f2.y - f1.y) * 0.7 + ny * curve * cs;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(f1.x, f1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, f2.x, f2.y);
    ctx.lineTo(r.x, r.y);
    ctx.closePath();

    // Back-side paper gradient (slightly darker / warmer)
    const backGrad = ctx.createLinearGradient(
        (f1.x + f2.x) / 2, (f1.y + f2.y) / 2, r.x, r.y
    );
    backGrad.addColorStop(0,   "#d9cfbf");
    backGrad.addColorStop(0.5, "#c8bca9");
    backGrad.addColorStop(1,   "#bdb09c");
    ctx.fillStyle = backGrad;
    ctx.fill();

    const pat2 = ctx.createPattern(grain, "repeat");
    if (pat2) { ctx.fillStyle = pat2; ctx.globalAlpha = 0.2; ctx.fill(); ctx.globalAlpha = 1; }

    // Specular gloss near the fold
    const glossGrad = ctx.createLinearGradient(f1.x, f1.y, r.x, r.y);
    glossGrad.addColorStop(0,   `rgba(255,255,255,${peakSin * 0.38})`);
    glossGrad.addColorStop(0.3, `rgba(255,255,255,${peakSin * 0.1})`);
    glossGrad.addColorStop(1,   "rgba(255,255,255,0)");
    ctx.fillStyle = glossGrad;
    ctx.fill();

    // ── 3. Crease line at the fold ─────────────────────────────────────────
    ctx.beginPath();
    ctx.moveTo(f1.x, f1.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, f2.x, f2.y);
    ctx.strokeStyle = `rgba(50,30,10,${peakSin * 0.55})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Thin highlight just aside the crease
    const hOff = 5 * cs;
    ctx.beginPath();
    ctx.moveTo(f1.x + nx * hOff, f1.y + ny * hOff);
    ctx.bezierCurveTo(
        cp1x + nx * hOff, cp1y + ny * hOff,
        cp2x + nx * hOff, cp2y + ny * hOff,
        f2.x + nx * hOff, f2.y + ny * hOff
    );
    ctx.strokeStyle = `rgba(255,255,255,${peakSin * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // ── 4. Drop shadow clipped to opposite region ──────────────────────────
    ctx.save();
    const oppPts = sortCCW([
        f1, f2, ...corners.filter(c => side(c.x, c.y, f1, f2) !== cSide),
    ]);
    ctx.beginPath();
    oppPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.clip();

    const dropLen = 90 * peakSin;
    const dropGrad = ctx.createLinearGradient(
        f1.x, f1.y,
        f1.x - nx * sDir * dropLen, f1.y - ny * sDir * dropLen
    );
    dropGrad.addColorStop(0,   `rgba(0,0,0,${peakSin * 0.28})`);
    dropGrad.addColorStop(0.5, `rgba(0,0,0,${peakSin * 0.06})`);
    dropGrad.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = dropGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────────────────
export function PageFlip({
    flipDir,
    phase,
    manualProgress,
    children,
    nextChildren,
}: PageFlipProps) {
    const containerRef  = useRef<HTMLDivElement>(null);
    const canvasRef     = useRef<HTMLCanvasElement>(null);
    const rafRef        = useRef<number | null>(null);

    // Sync canvas size to container
    useEffect(() => {
        const container = containerRef.current;
        const canvas    = canvasRef.current;
        if (!container || !canvas) return;

        const sync = () => {
            const W = container.offsetWidth;
            const H = container.offsetHeight;
            if (canvas.width !== W || canvas.height !== H) {
                canvas.width  = W;
                canvas.height = H;
            }
        };
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(container);
        return () => ro.disconnect();
    }, []);

    // Draw whenever any prop changes → use a RAF loop only while active
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (phase === "idle" && manualProgress < 0.002) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Draw once immediately
        drawPageCurl(ctx, canvas.width, canvas.height, manualProgress, flipDir ?? "next");

        // Keep redrawing if animating (spring loop drives state updates,
        // which drive this effect, but RAF keeps it silky)
        if (phase !== "idle") {
            const loop = () => {
                drawPageCurl(ctx, canvas.width, canvas.height, manualProgress, flipDir ?? "next");
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        }

        return () => {
            if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        };
    }, [phase, flipDir, manualProgress]);

    const isActive = phase !== "idle" || manualProgress > 0.005;

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {/* Back layer: next month visible through the curl */}
            <div className="w-full h-full">
                {nextChildren ?? children}
            </div>

            {/* Front layer: current month fades out past midpoint */}
            <div
                className="absolute inset-0 w-full"
                style={{
                    opacity: isActive && manualProgress > 0.48 ? 0 : 1,
                    pointerEvents: isActive ? "none" : "auto",
                    transition: manualProgress > 0.48 ? "opacity 80ms ease-out" : "none",
                }}
            >
                {children}
            </div>

            {/* Canvas: draws the page curl on top */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 30, display: isActive ? "block" : "none" }}
            />
        </div>
    );
}
