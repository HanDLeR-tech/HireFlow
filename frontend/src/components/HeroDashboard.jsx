import { useEffect, useRef } from "react";
import { Code2Icon, SparklesIcon, UsersIcon, VideoIcon, ZapIcon } from "lucide-react";

const panels = [
  {
    title: "Monaco Code Editor",
    meta: "Live editing · paired cursors",
    x: 12,
    y: 8,
    w: 38,
    h: 26,
    depth: 18,
    rotate: -8,
    accent: "from-[#4f86ff] to-[#22d3ff]",
    content: (
      <div className="space-y-2 font-mono text-[10px] text-slate-200/90">
        <div className="flex items-center justify-between text-[9px] text-slate-400">
          <span>two-sum.ts</span>
          <span>Real-time sync</span>
        </div>
        <div className="h-2 w-5/6 rounded-full bg-white/8" />
        <div className="h-2 w-2/3 rounded-full bg-cyan-300/20" />
        <div className="h-2 w-4/5 rounded-full bg-indigo-300/20" />
        <div className="grid grid-cols-2 gap-2 pt-2 text-[9px] text-cyan-100/80">
          <span className="rounded-lg bg-white/5 px-2 py-1">cursor A</span>
          <span className="rounded-lg bg-white/5 px-2 py-1">cursor B</span>
        </div>
      </div>
    ),
  },
  {
    title: "Problem Statement",
    meta: "Prompt · constraints",
    x: 4,
    y: 40,
    w: 28,
    h: 24,
    depth: 10,
    rotate: 7,
    accent: "from-[#7b6dff] to-[#4f86ff]",
    content: (
      <div className="space-y-2 text-[10px] text-slate-200/90">
        <div className="inline-flex rounded-full bg-white/8 px-2 py-1 text-cyan-100">Array · Hash Map</div>
        <p className="text-[11px] leading-snug text-slate-100/90">
          Solve the target pair while keeping both participants aligned on the same interview state.
        </p>
        <div className="space-y-1 text-slate-400">
          <div className="h-2 w-full rounded-full bg-white/8" />
          <div className="h-2 w-4/5 rounded-full bg-white/8" />
        </div>
      </div>
    ),
  },
  {
    title: "Video Interview",
    meta: "HD audio · camera",
    x: 50,
    y: 16,
    w: 34,
    h: 24,
    depth: 14,
    rotate: 6,
    accent: "from-[#0ea5e9] to-[#22d3ff]",
    content: (
      <div className="grid h-full grid-cols-[1.1fr_0.9fr] gap-2">
        <div className="rounded-2xl bg-[radial-gradient(circle_at_top,rgba(34,211,255,0.35),rgba(11,18,35,0.95))] p-3 ring-1 ring-white/10">
          <div className="flex h-full items-end justify-between">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-full border border-cyan-200/40 bg-cyan-200/20" />
              <div className="h-1.5 w-10 rounded-full bg-cyan-300/70" />
            </div>
            <div className="rounded-full bg-rose-500/90 px-2 py-1 text-[9px] font-semibold text-white">
              LIVE
            </div>
          </div>
        </div>
        <div className="space-y-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="h-6 rounded-full bg-white/10" />
          <div className="h-6 rounded-full bg-white/10" />
          <div className="h-6 rounded-full bg-white/10" />
        </div>
      </div>
    ),
  },
  {
    title: "AI Interview Assistant",
    meta: "Hints · follow-ups",
    x: 74,
    y: 40,
    w: 22,
    h: 24,
    depth: 20,
    rotate: -10,
    accent: "from-[#22d3ff] to-[#7b6dff]",
    content: (
      <div className="space-y-3 text-[10px] text-slate-200/90">
        <div className="flex items-center gap-2 text-cyan-100">
          <SparklesIcon className="size-4" />
          <span>AI suggestions</span>
        </div>
        <div className="space-y-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="h-2 w-4/5 rounded-full bg-cyan-200/70" />
          <div className="h-2 w-full rounded-full bg-white/10" />
          <div className="h-2 w-3/5 rounded-full bg-indigo-200/60" />
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-2 py-1 text-[9px] text-cyan-100">
          <ZapIcon className="size-3" />
          Clarify edge cases
        </div>
      </div>
    ),
  },
  {
    title: "Compiler Output",
    meta: "Tests · runtime",
    x: 36,
    y: 66,
    w: 31,
    h: 20,
    depth: 8,
    rotate: -5,
    accent: "from-[#2ecc91] to-[#22d3ff]",
    content: (
      <div className="space-y-2 font-mono text-[10px] text-slate-200/90">
        <div className="rounded-xl bg-black/20 px-2 py-1 text-emerald-200">✓ Passed 12 / 12 cases</div>
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-emerald-400/20" />
          <div className="h-2 w-11/12 rounded-full bg-amber-300/20" />
          <div className="h-2 w-2/3 rounded-full bg-rose-300/20" />
        </div>
      </div>
    ),
  },
  {
    title: "Session Live State",
    meta: "Connected users",
    x: 62,
    y: 2,
    w: 26,
    h: 18,
    depth: 24,
    rotate: 11,
    accent: "from-[#4f86ff] to-[#7b6dff]",
    content: (
      <div className="space-y-2 text-[10px] text-slate-200/90">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="size-6 rounded-full border border-slate-700 bg-slate-500/40" />
            <div className="size-6 rounded-full border border-slate-700 bg-cyan-400/50" />
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] text-emerald-200">
            synced
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div className="h-1.5 w-4/5 rounded-full bg-cyan-300/80" />
        </div>
      </div>
    ),
  },
];

function HeroDashboard() {
  const stageRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const handleMove = (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      stage.style.setProperty("--mx", x.toFixed(3));
      stage.style.setProperty("--my", y.toFixed(3));
    };

    const reset = () => {
      stage.style.setProperty("--mx", "0");
      stage.style.setProperty("--my", "0");
    };

    stage.addEventListener("pointermove", handleMove);
    stage.addEventListener("pointerleave", reset);

    return () => {
      stage.removeEventListener("pointermove", handleMove);
      stage.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="surface-grid relative mx-auto h-[540px] w-full max-w-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,22,40,0.96),rgba(5,10,18,0.92))] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
      style={{ perspective: "1800px", "--mx": 0, "--my": 0 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,255,0.18),transparent_28%),radial-gradient(circle_at_65%_65%,rgba(79,134,255,0.16),transparent_32%),radial-gradient(circle_at_35%_70%,rgba(123,109,255,0.12),transparent_28%)]" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute left-8 top-8 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-300/90 backdrop-blur-lg">
        Live collaboration stack
      </div>
      <div className="absolute right-8 top-8 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] text-emerald-100 backdrop-blur-lg">
        Real-time sync active
      </div>

      {panels.map((panel, index) => (
        <div
          key={panel.title}
          className={`absolute rounded-[1.25rem] border border-white/10 bg-white/8 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl ${
            index % 2 === 0 ? "float-slow" : "float-medium"
          }`}
          style={{
            left: `${panel.x}%`,
            top: `${panel.y}%`,
            width: `${panel.w}%`,
            height: `${panel.h}%`,
            transform: `translate3d(calc(var(--mx, 0) * ${panel.depth}px), calc(var(--my, 0) * ${panel.depth}px), ${panel.depth}px) rotateX(calc(var(--my, 0) * -8deg)) rotateY(calc(var(--mx, 0) * 10deg)) rotate(${panel.rotate}deg)`,
            zIndex: 10 + index,
          }}
        >
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${panel.accent} opacity-80`} />
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-white">{panel.title}</p>
              <p className="text-[10px] text-slate-300/75">{panel.meta}</p>
            </div>
            <div className={`size-2 rounded-full bg-gradient-to-br ${panel.accent} shadow-[0_0_18px_rgba(34,211,255,0.55)]`} />
          </div>
          {panel.content}
        </div>
      ))}

      <div className="absolute bottom-4 left-4 right-4 rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,31,0.96),rgba(8,13,24,0.86))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-100">
              <Code2Icon className="size-4" />
              HireFlow interview cockpit
            </div>
            <p className="mt-1 text-sm font-semibold text-white">Premium developer workflow for technical interviews</p>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-300/80">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
              <UsersIcon className="size-3.5 text-cyan-200" />
              2 participants
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
              <VideoIcon className="size-3.5 text-cyan-200" />
              Video + code
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
              <ZapIcon className="size-3.5 text-emerald-200" />
              99.9% uptime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroDashboard;