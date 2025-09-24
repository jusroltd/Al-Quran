import { useMemo, useRef, useState } from "react";

// 3D Animated Neumorphic Logo for "AL QURAN"
// Customizable via props
// Usage: <Logo3D size={64} monogram="AL" starStroke="#065f46" innerStroke="#f59e0b" gradientInner="#fff" gradientOuter="#e6e9ef" outerSpinSec={30} innerSpinSec={48} tiltMax={6} />
export const Logo3D = ({
  size = 64,
  dataTestId = "logo-3d",
  label = "AL QURAN 3D logo",
  monogram = "AL",
  monogramColor = "#0f172a",
  starStroke = "#065f46",
  innerStroke = "#f59e0b",
  innerFill = "#f7fafc",
  gradientInner = "#ffffff",
  gradientOuter = "#e6e9ef",
  outerSpinSec = 30,
  innerSpinSec = 48,
  tiltMax = 6,
}) => {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const dim = useMemo(() => ({ w: size, h: size }), [size]);
  const gradId = useMemo(() => `g${Math.random().toString(36).slice(2)}`, []);

  const onMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width; // -0.5..0.5
    const dy = (e.clientY - cy) / rect.height;
    const max = Math.max(0, Math.min(18, tiltMax));
    setTilt({ x: Math.max(-max, Math.min(max, -dy * (max))), y: Math.max(-max, Math.min(max, dx * (max))) });
  };

  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={containerRef}
      className="logo3d n-card"
      style={{ width: dim.w, height: dim.h, borderRadius: dim.w / 4 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-testid={dataTestId}
      aria-label={label}
      role="img"
    >
      <div
        className="logo3d-inner"
        style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <svg width={dim.w} height={dim.h} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
          <defs>
            <radialGradient id={gradId} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={gradientInner} stopOpacity="0.9" />
              <stop offset="100%" stopColor={gradientOuter} stopOpacity="0.6" />
            </radialGradient>
          </defs>
          {/* Outer ring with subtle gradient */}
          <circle cx="50" cy="50" r="36" fill={`url(#${gradId})`} opacity="0.85" />
          {/* Eight-pointed star outline */}
          <g className="spin-slow" style={{ animationDuration: `${outerSpinSec}s` }}>
            <polygon
              points="50,20 61,39 84,39 66,53 72,76 50,64 28,76 34,53 16,39 39,39"
              fill="none"
              stroke={starStroke}
              strokeOpacity="0.6"
              strokeWidth="2.2"
            />
          </g>
          {/* Inner rotating star */}
          <g className="spin-slower" style={{ animationDuration: `${innerSpinSec}s` }} transform="translate(50,50)">
            <polygon
              points="0,-18 8,-6 18,0 8,6 0,18 -8,6 -18,0 -8,-6"
              fill={innerFill}
              stroke={innerStroke}
              strokeOpacity="0.65"
              strokeWidth="1.6"
            />
          </g>
          {/* Center monogram */}
          <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800" fill={monogramColor} style={{ letterSpacing: 1 }}>
            {monogram}
          </text>
        </svg>
      </div>
    </div>
  );
};