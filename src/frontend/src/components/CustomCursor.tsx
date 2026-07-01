import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Ripple = { id: number; x: number; y: number };

/* ------------------------------------------------------------------ */
/*  Shared ripple styles                                               */
/* ------------------------------------------------------------------ */

const RIPPLE_STYLES = `
  @keyframes tap-ripple {
    0% {
      width: 0px; height: 0px; opacity: 0.9;
      box-shadow: 0 0 0 0 oklch(0.82 0.22 295 / 0.7);
      background: oklch(0.82 0.22 295 / 0.5);
    }
    100% {
      width: 60px; height: 60px; opacity: 0;
      box-shadow: 0 0 16px 8px oklch(0.62 0.22 295 / 0);
      background: oklch(0.82 0.22 295 / 0);
    }
  }
  @keyframes click-ripple {
    0% {
      width: 0px; height: 0px; opacity: 0.85;
      box-shadow: 0 0 0 0 oklch(0.82 0.22 295 / 0.7);
      background: oklch(0.82 0.22 295 / 0.45);
    }
    100% {
      width: 60px; height: 60px; opacity: 0;
      box-shadow: 0 0 16px 8px oklch(0.62 0.22 295 / 0);
      background: oklch(0.82 0.22 295 / 0);
    }
  }
`;

function RippleLayer({
  ripples,
  animationName,
}: {
  ripples: Ripple[];
  animationName: string;
}) {
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
            animation: `${animationName} 0.6s ease-out forwards`,
          }}
        />
      ))}
      <style>{RIPPLE_STYLES}</style>
    </>
  );
}

function useRipples(eventName: "mousedown" | "touchstart") {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  useEffect(() => {
    let id = 0;
    const handler = (e: MouseEvent | TouchEvent) => {
      const point =
        eventName === "touchstart"
          ? (e as TouchEvent).changedTouches[0]
          : (e as MouseEvent);
      const newRipple = { id: id++, x: point.clientX, y: point.clientY };
      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };
    document.addEventListener(eventName, handler as EventListener);
    return () =>
      document.removeEventListener(eventName, handler as EventListener);
  }, [eventName]);
  return ripples;
}

function TapRipple() {
  const ripples = useRipples("touchstart");
  return <RippleLayer ripples={ripples} animationName="tap-ripple" />;
}

function ClickRipple() {
  const ripples = useRipples("mousedown");
  return <RippleLayer ripples={ripples} animationName="click-ripple" />;
}

/* ------------------------------------------------------------------ */
/*  Dot + ring cursor (original design)                               */
/* ------------------------------------------------------------------ */
/*  Two layers only:
      - cc-dot  : small solid purple filled circle, the primary pointer.
                  Snappy spring (stiff, low mass) so it sits exactly on the
                  pointer hot spot with no lag.
      - cc-ring : purple-bordered circle surrounding the dot. Rides a softer
                  spring so it trails slightly behind the dot for a comet
                  feel — tuned tighter than the previous 1050/36/0.26 so the
                  lag is short and subtle, but still distinct from the dot's
                  instant tracking.
    No mouse-pointer SVG sprite, no separate glow layer.                */

const DOT_SIZE = 8; // dot diameter in px
const DOT_HALF = DOT_SIZE / 2;

const RING_SIZE = 34; // ring diameter in px (surrounds the dot)
const RING_HALF = RING_SIZE / 2;

const CURSOR_CSS = `
  /* Hide the OS cursor only on fine-pointer devices with the cursor active */
  body.cc-cursor-active, body.cc-cursor-active * { cursor: none !important; }

  /* Primary dot: solid purple filled circle. Snappy spring tracks the
     pointer exactly — this IS the hot spot. */
  .cc-dot {
    position: fixed;
    top: 0; left: 0;
    width: ${DOT_SIZE}px; height: ${DOT_SIZE}px;
    border-radius: 50%;
    background: oklch(0.82 0.22 295);
    box-shadow: 0 0 6px oklch(0.82 0.22 295 / 0.6);
    pointer-events: none;
    will-change: transform;
  }
  /* Trailing ring: purple-bordered circle that lags slightly behind the dot
     for a comet/trailing feel. Tuned tighter than before so the lag is short
     and subtle, but still visibly trails the dot. */
  .cc-ring {
    position: fixed;
    top: 0; left: 0;
    width: ${RING_SIZE}px; height: ${RING_SIZE}px;
    border-radius: 50%;
    border: 2px solid oklch(0.82 0.22 295 / 0.85);
    box-shadow: 0 0 8px oklch(0.82 0.22 295 / 0.45),
                inset 0 0 6px oklch(0.62 0.22 295 / 0.35);
    pointer-events: none;
    will-change: transform;
  }
  @media (prefers-reduced-motion: reduce) {
    .cc-ring { box-shadow: none !important; }
  }
`;

function FancyCursor() {
  const [reduced, setReduced] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const ready = useRef(false);

  // Raw pointer position. The dot's hot spot is its center, so no offset is
  // baked in — the spring output is the final translate3d target. The ring
  // reads the same raw value and applies its own centering offset.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Dot spring — SNAPPY. High stiffness + low mass so the dot tracks the
  // pointer tightly with no trailing lag. Damping keeps it from overshooting.
  // Reduced-motion is near-instant for responsive tracking.
  const dotSpring = reduced
    ? { stiffness: 5000, damping: 200, mass: 0.05 }
    : { stiffness: 2200, damping: 38, mass: 0.12 };
  const dx = useSpring(x, dotSpring);
  const dy = useSpring(y, dotSpring);

  // Ring spring — softer than the dot so the ring lags slightly behind,
  // producing the comet/trailing effect. Tuned noticeably tighter than the
  // previous 1050/36/0.26: higher stiffness + lower mass so the ring follows
  // the dot with only a short, subtle lag — still distinct from the dot's
  // instant spring, but less delay than before.
  const ringSpring = reduced
    ? dotSpring
    : { stiffness: 1700, damping: 32, mass: 0.16 };
  const rx = useSpring(x, ringSpring);
  const ry = useSpring(y, ringSpring);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onReduced = () => setReduced(mq.matches);

    const onMove = (e: MouseEvent) => {
      if (!ready.current) {
        ready.current = true;
        setVisible(true);
      }
      // Dot hot spot is its center, so the raw pointer value is the dot's
      // top-left target. The ring reads the same value and centers itself
      // via its own translate offset.
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const isInteractive = (el: Element | null): boolean => {
      if (!el || !(el instanceof Element)) return false;
      return !!el.closest(
        'a, button, [role="button"], input, textarea, select, label, .minecraft-btn, .pixel-border, .pixel-border-purple, [data-ocid]',
      );
    };

    const onOver = (e: MouseEvent) => {
      setHovering(isInteractive(e.target as Element));
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Hide OS cursor
    document.body.classList.add("cc-cursor-active");

    return () => {
      mq.removeEventListener("change", onReduced);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.body.classList.remove("cc-cursor-active");
    };
  }, [x, y]);

  // Ring centering: the ring's spring (rx/ry) tracks the same raw pointer
  // value as the dot, but the ring box must be centered on the pointer.
  // We add a translate offset so the ring centers on the pointer while still
  // riding the laggy ringSpring.
  const ringCenterX = -RING_HALF;
  const ringCenterY = -RING_HALF;
  const dotCenterX = -DOT_HALF;
  const dotCenterY = -DOT_HALF;

  return (
    <>
      {/* Trailing ring: purple-bordered circle that lags slightly behind the
          dot for a comet effect. Rides the ringSpring (softer than the dot
          spring, but tighter than the previous 1050/36/0.26). Remains part
          of the cursor at all times. */}
      <motion.div
        aria-hidden="true"
        className="cc-ring"
        style={{
          x: rx,
          y: ry,
          translateX: ringCenterX,
          translateY: ringCenterY,
          opacity: visible ? 1 : 0,
          zIndex: 99997,
        }}
        animate={{
          scale: reduced ? 1 : hovering ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* Primary dot: solid purple filled circle. Snappy spring tracks the
          pointer exactly — this is the hot spot. */}
      <motion.div
        aria-hidden="true"
        className="cc-dot"
        style={{
          x: dx,
          y: dy,
          translateX: dotCenterX,
          translateY: dotCenterY,
          opacity: visible ? 1 : 0,
          zIndex: 99998,
        }}
        animate={{
          scale: reduced ? 1 : hovering ? 1.25 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      <style>{CURSOR_CSS}</style>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkTouch = () => window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(checkTouch());
    setChecked(true);
  }, []);

  // Avoid a flash of wrong cursor before the check completes
  if (!checked) return null;

  if (isTouchDevice) {
    // Touch users: normal OS behavior + tap ripple. No custom cursor, no cursor:none.
    return <TapRipple />;
  }

  return (
    <>
      <FancyCursor />
      <ClickRipple />
    </>
  );
}
