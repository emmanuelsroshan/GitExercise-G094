import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function getColor(score) {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MatchScore({ score = 0, size = 80, showLabel = true }) {
  const color = getColor(score);
  const dashOffset = useMotionValue(CIRCUMFERENCE);
  const targetOffset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  useEffect(() => {
    const controls = animate(dashOffset, targetOffset, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [score, targetOffset, dashOffset]);

  const isHigh = score >= 75;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
        />
        {/* Animated foreground ring */}
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset }}
          transform="rotate(-90 50 50)"
        />
      </svg>

      {showLabel && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <span
            className={isHigh ? "gradient-text" : undefined}
            style={{
              fontSize: Math.round(size * 0.22),
              fontWeight: 800,
              lineHeight: 1,
              color: isHigh ? undefined : color,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: Math.round(size * 0.12),
              color: "var(--text-tertiary)",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            %
          </span>
        </div>
      )}
    </div>
  );
}
