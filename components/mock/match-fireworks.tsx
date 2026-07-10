"use client";

import type { CSSProperties } from "react";
import styles from "./match-fireworks.module.css";

export const MATCH_FIREWORKS_DURATION_MS = 860;

const PARTICLES_PER_BURST = 18;
const COLORS = ["#ff0002", "#ffd54a", "#ffffff", "#53d8fb", "#70e000"];
const BURSTS = [
  { delay: 0, x: 18, y: 34 },
  { delay: 60, x: 50, y: 21 },
  { delay: 120, x: 82, y: 38 },
] as const;

type FireworkStyle = CSSProperties & {
  "--burst-x": string;
  "--burst-y": string;
  "--particle-color": string;
  "--particle-delay": string;
  "--particle-rotation": string;
  "--particle-size": string;
  "--particle-x": string;
  "--particle-y": string;
};

const PARTICLES = BURSTS.flatMap((burst, burstIndex) =>
  Array.from({ length: PARTICLES_PER_BURST }, (_, particleIndex) => ({
    key: `${burstIndex}-${particleIndex}`,
    style: createParticleStyle(burst, burstIndex, particleIndex),
  })),
);

export function MatchFireworks() {
  return (
    <div aria-hidden="true" className={styles.viewport}>
      {PARTICLES.map((particle) => (
        <span
          className={styles.particle}
          key={particle.key}
          style={particle.style}
        />
      ))}
    </div>
  );
}

function createParticleStyle(
  burst: (typeof BURSTS)[number],
  burstIndex: number,
  particleIndex: number,
): FireworkStyle {
  const angle =
    (particleIndex / PARTICLES_PER_BURST) * Math.PI * 2 + burstIndex * 0.18;
  const distance = 76 + ((particleIndex * 19 + burstIndex * 31) % 62);
  const particleX = Math.cos(angle) * distance;
  const particleY = Math.sin(angle) * distance + 14;

  return {
    "--burst-x": `${burst.x}%`,
    "--burst-y": `${burst.y}%`,
    "--particle-color": COLORS[(particleIndex + burstIndex) % COLORS.length],
    "--particle-delay": `${burst.delay + (particleIndex % 4) * 12}ms`,
    "--particle-rotation": `${180 + particleIndex * 37}deg`,
    "--particle-size": `${3 + ((particleIndex + burstIndex) % 3)}px`,
    "--particle-x": `${particleX.toFixed(1)}px`,
    "--particle-y": `${particleY.toFixed(1)}px`,
  };
}
