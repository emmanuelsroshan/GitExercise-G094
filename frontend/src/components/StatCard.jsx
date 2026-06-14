import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const COLOR_MAP = {
  purple: {
    bg: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(109,40,217,0.15))",
    icon: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    text: "#a78bfa",
    shadow: "rgba(124,58,237,0.3)",
  },
  green: {
    bg: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.12))",
    icon: "linear-gradient(135deg, #10b981, #059669)",
    text: "#34d399",
    shadow: "rgba(16,185,129,0.3)",
  },
  amber: {
    bg: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.12))",
    icon: "linear-gradient(135deg, #f59e0b, #d97706)",
    text: "#fbbf24",
    shadow: "rgba(245,158,11,0.3)",
  },
  blue: {
    bg: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.12))",
    icon: "linear-gradient(135deg, #3b82f6, #2563eb)",
    text: "#60a5fa",
    shadow: "rgba(59,130,246,0.3)",
  },
};

function useCountUp(target, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const numericTarget = parseFloat(target);
  const isNumeric = !isNaN(numericTarget);

  useEffect(() => {
    if (!isNumeric) {
      setDisplay(target);
      return;
    }
    startRef.current = null;
    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numericTarget));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [numericTarget, isNumeric, duration, target]);

  return display;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "purple",
}) {
  const colors = COLOR_MAP[color] || COLOR_MAP.purple;
  const displayed = useCountUp(value);
  const isNumeric = !isNaN(parseFloat(value));
  const isTrendPositive = trend && trend.startsWith("+");

  return (
    <motion.div
      className="glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        background: colors.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: colors.shadow,
          filter: "blur(28px)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
        {/* Icon circle */}
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: colors.icon,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 14px ${colors.shadow}`,
              flexShrink: 0,
            }}
          >
            <Icon size={22} color="#fff" strokeWidth={2} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              marginBottom: "0.2rem",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: colors.text,
              lineHeight: 1,
            }}
          >
            {isNumeric ? displayed : value}
          </div>
        </div>
      </div>

      {trend && (
        <div
          style={{
            fontSize: "0.75rem",
            color: isTrendPositive ? "#34d399" : "#f87171",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <span>{isTrendPositive ? "↑" : "↓"}</span>
          <span>{trend} from last week</span>
        </div>
      )}
    </motion.div>
  );
}
