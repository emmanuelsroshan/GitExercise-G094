const PALETTE = [
  "linear-gradient(135deg, #7c3aed, #6d28d9)",
  "linear-gradient(135deg, #4f46e5, #4338ca)",
  "linear-gradient(135deg, #2563eb, #1d4ed8)",
  "linear-gradient(135deg, #0891b2, #0e7490)",
  "linear-gradient(135deg, #7e22ce, #6b21a8)",
  "linear-gradient(135deg, #3730a3, #312e81)",
  "linear-gradient(135deg, #0284c7, #0369a1)",
  "linear-gradient(135deg, #0d9488, #0f766e)",
];

function getColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = "", size = 40 }) {
  const initials = getInitials(name);
  const background = getColor(name);
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.04em",
        userSelect: "none",
        boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
        flexShrink: 0,
      }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
