import { useEffect, useRef, useState } from "react";

function TapRipple() {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  useEffect(() => {
    let id = 0;
    const onTouch = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const newRipple = { id: id++, x: touch.clientX, y: touch.clientY };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };
    document.addEventListener("touchstart", onTouch);
    return () => document.removeEventListener("touchstart", onTouch);
  }, []);

  return (
    <>
      {ripples.map((r) => (
        <div
          key={r.id}
          style={{
            position: "fixed",
            top: r.y,
            left: r.x,
            width: 0,
            height: 0,
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 99999,
            transform: "translate(-50%, -50%)",
            animation: "tap-ripple 0.6s ease-out forwards",
          }}
        />
      ))}
      <style>{`
        @keyframes tap-ripple {
          0% {
            width: 0px;
            height: 0px;
            opacity: 0.9;
            box-shadow: 0 0 0 0 oklch(0.82 0.22 295 / 0.7);
            background: oklch(0.82 0.22 295 / 0.5);
          }
          100% {
            width: 60px;
            height: 60px;
            opacity: 0;
            box-shadow: 0 0 16px 8px oklch(0.62 0.22 295 / 0);
            background: oklch(0.82 0.22 295 / 0);
          }
        }
      `}</style>
    </>
  );
}

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const raf = useRef<number>(0);

  useEffect(() => {
    const checkTouch = () => window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(checkTouch());
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest("a, button, [role='button'], input, select, textarea, label")
      ) {
        setHovered(true);
      }
    };
    const onLeave = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest("a, button, [role='button'], input, select, textarea, label")
      ) {
        setHovered(false);
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.22;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) {
    return <TapRipple />;
  }

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovered ? "12px" : "8px",
          height: hovered ? "12px" : "8px",
          borderRadius: "50%",
          background: hovered ? "oklch(0.82 0.22 295)" : "oklch(0.75 0.20 295)",
          pointerEvents: "none",
          zIndex: 99999,
          transition: "width 0.2s, height 0.2s, background 0.2s",
          boxShadow:
            "0 0 8px oklch(0.75 0.20 295 / 0.9), 0 0 16px oklch(0.62 0.22 295 / 0.6)",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className={hovered ? "cursor-ring-hovered" : "cursor-ring"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovered ? "48px" : "32px",
          height: hovered ? "48px" : "32px",
          borderRadius: "50%",
          border: hovered
            ? "2px solid oklch(0.82 0.22 295)"
            : "2px solid oklch(0.62 0.22 295 / 0.7)",
          pointerEvents: "none",
          zIndex: 99998,
          transition: "width 0.25s, height 0.25s, border-color 0.25s",
          animation: "cursor-pulse 2s ease-in-out infinite",
        }}
      />
    </>
  );
}
