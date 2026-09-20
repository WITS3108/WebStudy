import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, Headphones, Pause, Play, RotateCcw, Timer } from "lucide-react";

const PRESETS = [15, 25, 45];
const BREAK_MINUTES = 5;

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PomodoroPanel() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(2);
  const [lofi, setLofi] = useState(false);

  const audioRef = useRef<{ ctx: AudioContext; gain: GainNode; nodes: AudioNode[] } | null>(null);

  const totalSeconds = (mode === "focus" ? focusMinutes : BREAK_MINUTES) * 60;
  const progress = totalSeconds === 0 ? 0 : 1 - remaining / totalSeconds;

  const chime = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
      setTimeout(() => void ctx.close(), 1500);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Session finished: chime and switch between focus and break.
  useEffect(() => {
    if (!running || remaining > 0) return;
    chime();
    if (mode === "focus") {
      setSessions((s) => Math.min(s + 1, 4));
      setMode("break");
      setRemaining(BREAK_MINUTES * 60);
    } else {
      setMode("focus");
      setRemaining(focusMinutes * 60);
    }
  }, [remaining, running, mode, focusMinutes, chime]);

  // Ambient lo-fi pad generated in the browser (no external stream needed).
  useEffect(() => {
    if (!lofi) {
      const current = audioRef.current;
      if (current) {
        current.gain.gain.linearRampToValueAtTime(0, current.ctx.currentTime + 0.4);
        setTimeout(() => void current.ctx.close(), 600);
        audioRef.current = null;
      }
      return;
    }

    try {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.2);
      master.connect(ctx.destination);

      const nodes: AudioNode[] = [];
      // warm chord pad
      [146.83, 220, 261.63, 329.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        g.gain.value = 0.22 / (i + 1);
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.06 + i * 0.02;
        lfoGain.gain.value = 0.1;
        lfo.connect(lfoGain).connect(g.gain);
        lfo.start();
        osc.connect(g).connect(master);
        osc.start();
        nodes.push(osc, lfo);
      });

      // soft vinyl-ish noise
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.28;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.06;
      noise.connect(filter).connect(noiseGain).connect(master);
      noise.start();
      nodes.push(noise);

      audioRef.current = { ctx, gain: master, nodes };
    } catch {
      /* audio not available */
    }

    return () => {
      const current = audioRef.current;
      if (current) {
        void current.ctx.close();
        audioRef.current = null;
      }
    };
  }, [lofi]);

  const setPreset = (m: number) => {
    setFocusMinutes(m);
    if (mode === "focus") {
      setRemaining(m * 60);
      setRunning(false);
    }
  };

  const reset = () => {
    setRunning(false);
    setMode("focus");
    setRemaining(focusMinutes * 60);
  };

  const R = 78;
  const circumference = 2 * Math.PI * R;

  return (
    <section className="card-soft animate-fade-up p-5" style={{ animationDelay: "160ms" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === "focus" ? (
            <Timer className="h-4 w-4 text-primary" />
          ) : (
            <Coffee className="h-4 w-4 text-primary" />
          )}
          <h2 className="text-base font-black text-foreground">Pomodoro</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i < sessions ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 grid place-items-center">
        <div className="relative h-[196px] w-[196px]">
          <svg viewBox="0 0 196 196" className="h-full w-full -rotate-90">
            <circle cx="98" cy="98" r={R} fill="none" stroke="var(--color-muted)" strokeWidth="12" />
            <circle
              cx="98"
              cy="98"
              r={R}
              fill="none"
              stroke={mode === "focus" ? "var(--color-primary)" : "var(--color-success)"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-4xl font-black tabular-nums text-foreground">
              {format(remaining)}
            </span>
            <span className="mt-14 absolute text-xs font-bold text-primary">
              {mode === "focus" ? "Thời gian tập trung" : "Nghỉ ngắn"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="minutes" className="text-sm font-bold text-foreground">
            Chọn phút:
          </label>
          <input
            id="minutes"
            type="number"
            min={1}
            max={120}
            value={focusMinutes}
            onChange={(e) => setPreset(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
            className="h-9 w-20 rounded-full border border-border bg-card px-3 text-center text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
        <div className="mt-3 flex gap-2">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m)}
              className={`btn-press flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                focusMinutes === m
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {m} phút
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={reset}
          className="btn-press flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/40 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10"
        >
          <RotateCcw className="h-4 w-4" />
          Đặt lại
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="btn-press flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary-deep"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Tạm dừng" : "Bắt đầu"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
        <Headphones className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Âm thanh lo-fi</p>
          <p className="text-xs font-medium text-muted-foreground">Nền ấm nhẹ giúp tập trung</p>
        </div>
        {lofi && (
          <div className="flex h-5 items-end gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="animate-wave w-[3px] origin-bottom rounded-full bg-primary"
                style={{ height: "100%", animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}
        <button
          onClick={() => setLofi((v) => !v)}
          role="switch"
          aria-checked={lofi}
          aria-label="Bật âm thanh lo-fi"
          className={`btn-press relative h-6 w-11 shrink-0 rounded-full ${lofi ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all duration-300 ${
              lofi ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
