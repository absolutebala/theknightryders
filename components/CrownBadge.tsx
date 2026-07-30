export default function CrownBadge({ size = 24 }: { size?: number }) {
  return (
    <div
      title="Elite member"
      style={{
        position: "absolute",
        top: -size * 0.3,
        right: -size * 0.15,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0c0e12",
        border: "1.5px solid #d4af37",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.55,
        boxShadow: "0 2px 8px rgba(0,0,0,.5)",
        lineHeight: 1,
        zIndex: 2,
      }}
    >
      &#128081;
    </div>
  );
}
