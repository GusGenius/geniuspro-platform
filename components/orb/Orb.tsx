"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./orb.css";

interface OrbProps {
  size?: "small" | "medium" | "large";
  className?: string;
  label?: string;
}

const OrbSizes = {
  small: { width: "160px", height: "160px" },
  medium: { width: "260px", height: "260px" },
  large: { width: "320px", height: "320px" },
};

export function Orb({ size = "large", className, label = "G" }: OrbProps) {
  const sizeConfig = OrbSizes[size];
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const orbRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!orbRef.current) return;
      const rect = orbRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x, y });
    },
    []
  );

  const handleMouseLeave = React.useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const moveX = mousePosition.x * 15;
  const moveY = mousePosition.y * 15;
  const rotateX = -mousePosition.y * 10;
  const rotateY = mousePosition.x * 10;

  return (
    <div
      ref={orbRef}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        "overflow-visible",
        className
      )}
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient glow behind orb */}
      <div
        className="absolute inset-0 rounded-full blur-[50px] opacity-30 transition-all duration-300 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.08) 25%, transparent 70%)",
          transform: `translate3d(${-mousePosition.x * 20}px, ${-mousePosition.y * 20}px, 0)`,
        }}
      />

      {/* Scene wrapper for parallax */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: "50% 50%",
          transition: "transform 0.1s ease-out",
        }}
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full overflow-visible"
          style={{ shapeRendering: "geometricPrecision" }}
        >
          <defs>
            {/* Core Gradient - Glass look (dark optimized) */}
            <radialGradient id="gp-mainCoreGradient" cx="45%" cy="40%" r="75%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
              <stop offset="50%" stopColor="rgba(240, 247, 255, 0.04)" />
              <stop offset="100%" stopColor="rgba(208, 231, 255, 0.01)" />
            </radialGradient>

            {/* Soft Shine Gradient */}
            <radialGradient id="gp-softShineGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>

            {/* Shadow Gradient */}
            <radialGradient id="gp-shadowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* Rim Gradient */}
            <linearGradient
              id="gp-rimGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
            </linearGradient>

            {/* Orbital gradients */}
            <linearGradient
              id="gp-orbitalGradient1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop
                offset="20%"
                stopColor="rgba(156, 163, 175, 0.6)"
              />
              <stop
                offset="50%"
                stopColor="rgba(255,255,255,0.8)"
              />
              <stop
                offset="80%"
                stopColor="rgba(107, 114, 128, 0.6)"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <linearGradient
              id="gp-orbitalGradient2"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="transparent" />
              <stop
                offset="20%"
                stopColor="rgba(107, 114, 128, 0.6)"
              />
              <stop
                offset="50%"
                stopColor="rgba(255,255,255,0.8)"
              />
              <stop
                offset="80%"
                stopColor="rgba(156, 163, 175, 0.6)"
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Core Glow Filter */}
            <filter
              id="gp-coreGlow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Realistic shadow filter */}
            <filter
              id="gp-realisticShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="12" />
              <feOffset dx="0" dy="8" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
            </filter>

            {/* Orbital glow filter */}
            <filter
              id="gp-orbitalGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Orb Core Group */}
          <g className="orb-core" transform-origin="center">
            {/* Subtle shadow underneath */}
            <ellipse
              cx="150"
              cy="225"
              rx="80"
              ry="20"
              fill="url(#gp-shadowGradient)"
              filter="url(#gp-realisticShadow)"
              opacity="0.15"
            />

            {/* Main glowing sphere - Glass */}
            <circle
              className="main-sphere"
              cx="150"
              cy="150"
              r="100"
              fill="url(#gp-mainCoreGradient)"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />

            {/* Soft Primary Shine */}
            <ellipse
              className="highlight-soft"
              cx="120"
              cy="95"
              rx="75"
              ry="50"
              fill="url(#gp-softShineGradient)"
              transform="rotate(-30, 120, 95)"
              opacity="0.35"
            />

            {/* Rim Definition */}
            <circle
              cx="150"
              cy="150"
              r="99.5"
              fill="none"
              stroke="url(#gp-rimGradient)"
              strokeWidth="0.8"
              opacity="0.4"
            />

            {/* "G" Symbol - GeniusPro branding */}
            <foreignObject x="50" y="50" width="200" height="200">
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily:
                    "'Google Sans Flex', system-ui, sans-serif",
                  fontSize: "90px",
                  fontWeight: 100,
                  textTransform: "uppercase",
                  color: "#ffffff",
                  userSelect: "none",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {label}
              </div>
            </foreignObject>

            {/* Orbital Rings */}
            <g className="orbitals" opacity="0.8">
              {/* Primary orbital */}
              <ellipse
                cx="150"
                cy="150"
                rx="135"
                ry="42"
                fill="none"
                stroke="url(#gp-orbitalGradient1)"
                strokeWidth="1"
                strokeLinecap="round"
                filter="url(#gp-orbitalGlow)"
                transform="rotate(45 150 150)"
                opacity="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 150 150"
                  to="360 150 150"
                  dur="24s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.7"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </ellipse>

              {/* Secondary orbital */}
              <ellipse
                cx="150"
                cy="150"
                rx="135"
                ry="42"
                fill="none"
                stroke="url(#gp-orbitalGradient2)"
                strokeWidth="1"
                strokeLinecap="round"
                filter="url(#gp-orbitalGlow)"
                transform="rotate(-45 150 150)"
                opacity="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 150 150"
                  to="0 150 150"
                  dur="30s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.7;1;0.7"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </ellipse>

              {/* Tertiary orbital - subtle dashed */}
              <ellipse
                cx="150"
                cy="150"
                rx="140"
                ry="45"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.5"
                strokeDasharray="3,8"
                strokeLinecap="round"
                transform="rotate(0 150 150)"
                opacity="0.6"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 150 150"
                  to="360 150 150"
                  dur="40s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
