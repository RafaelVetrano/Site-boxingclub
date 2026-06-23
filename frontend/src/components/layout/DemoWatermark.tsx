const svgMark = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
    <text x="110" y="110" text-anchor="middle" dominant-baseline="middle"
      font-family="Bebas Neue, sans-serif" font-size="36" letter-spacing="6"
      fill="rgba(220,38,38,0.07)" transform="rotate(-40,110,110)">DEMO</text>
  </svg>`
);

export function DemoWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{ backgroundImage: `url("data:image/svg+xml,${svgMark}")`, backgroundRepeat: 'repeat' }}
    />
  );
}
