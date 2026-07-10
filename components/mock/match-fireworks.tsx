"use client";

import type { CSSProperties } from "react";
import styles from "./match-fireworks.module.css";

const MATCH_PYRO_DURATION_MS = 550;
const FINAL_PYRO_DURATION_MS = 1080;
const SPARKS_PER_JET = 16;
const SPARK_COLORS = ["#ffffff", "#ffd54a", "#ff3b3d"];
const JETS = [
  { angle: -4, delay: 0, finalOnly: false, height: 48, x: 13 },
  { angle: 4, delay: 0, finalOnly: false, height: 48, x: 87 },
  { angle: -2, delay: 90, finalOnly: true, height: 56, x: 35 },
  { angle: 2, delay: 90, finalOnly: true, height: 56, x: 65 },
] as const;

type JetStyle = CSSProperties & {
  "--jet-angle": string;
  "--jet-delay": string;
  "--jet-height": string;
  "--jet-x": string;
};

type SparkStyle = CSSProperties & {
  "--spark-color": string;
  "--spark-delay": string;
  "--spark-drift": string;
  "--spark-height": string;
  "--spark-rise": string;
  "--spark-rotation": string;
  "--spark-x": string;
};

type GoldSparkStyle = CSSProperties & {
  "--gold-delay": string;
  "--gold-drift": string;
  "--gold-fall": string;
  "--gold-rotation": string;
  "--gold-x": string;
};

const PYRO_JETS = JETS.map((jet, jetIndex) => ({
  finalOnly: jet.finalOnly,
  key: `jet-${jetIndex}`,
  style: createJetStyle(jet),
}));

const PYRO_SPARKS = JETS.flatMap((jet, jetIndex) =>
  Array.from({ length: SPARKS_PER_JET }, (_, sparkIndex) => ({
    finalOnly: jet.finalOnly,
    key: `spark-${jetIndex}-${sparkIndex}`,
    style: createSparkStyle(jet, jetIndex, sparkIndex),
  })),
);

const GOLD_SPARKS = Array.from({ length: 24 }, (_, index) => ({
  key: `gold-${index}`,
  style: createGoldSparkStyle(index),
}));

export function getMatchFireworksDuration(isFinal: boolean) {
  return isFinal ? FINAL_PYRO_DURATION_MS : MATCH_PYRO_DURATION_MS;
}

export function getArenaImpactClassName(isFinal: boolean) {
  return [styles.arenaImpact, isFinal ? styles.finalImpact : ""]
    .filter(Boolean)
    .join(" ");
}

export function MatchFireworks({ isFinal }: { isFinal: boolean }) {
  const jets = PYRO_JETS.filter((jet) => isFinal || !jet.finalOnly);
  const sparks = PYRO_SPARKS.filter((spark) => isFinal || !spark.finalOnly);

  return (
    <div
      aria-hidden="true"
      className={[styles.viewport, isFinal ? styles.final : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.flash} />
      {jets.map((jet) => (
        <span
          className={styles.jet}
          key={jet.key}
          style={jet.style}
        />
      ))}
      {sparks.map((spark) => (
        <span className={styles.spark} key={spark.key} style={spark.style} />
      ))}
      {isFinal
        ? GOLD_SPARKS.map((spark) => (
            <span
              className={styles.goldSpark}
              key={spark.key}
              style={spark.style}
            />
          ))
        : null}
    </div>
  );
}

function createJetStyle(jet: (typeof JETS)[number]): JetStyle {
  return {
    "--jet-angle": `${jet.angle}deg`,
    "--jet-delay": `${jet.delay}ms`,
    "--jet-height": `${jet.height}svh`,
    "--jet-x": `${jet.x}%`,
  };
}

function createSparkStyle(
  jet: (typeof JETS)[number],
  jetIndex: number,
  sparkIndex: number,
): SparkStyle {
  const direction = sparkIndex % 2 === 0 ? -1 : 1;
  const drift = direction * (8 + ((sparkIndex * 11 + jetIndex * 7) % 42));
  const rise = 250 + ((sparkIndex * 29 + jetIndex * 47) % 250);

  return {
    "--spark-color": SPARK_COLORS[(sparkIndex + jetIndex) % SPARK_COLORS.length],
    "--spark-delay": `${jet.delay + (sparkIndex % 5) * 12}ms`,
    "--spark-drift": `${drift}px`,
    "--spark-height": `${6 + ((sparkIndex + jetIndex) % 5)}px`,
    "--spark-rise": `-${rise}px`,
    "--spark-rotation": `${jet.angle + direction * (4 + (sparkIndex % 8))}deg`,
    "--spark-x": `${jet.x}%`,
  };
}

function createGoldSparkStyle(index: number): GoldSparkStyle {
  return {
    "--gold-delay": `${190 + (index % 6) * 24}ms`,
    "--gold-drift": `${((index * 17) % 54) - 27}px`,
    "--gold-fall": `${48 + ((index * 13) % 28)}svh`,
    "--gold-rotation": `${180 + index * 43}deg`,
    "--gold-x": `${5 + ((index * 37) % 90)}%`,
  };
}
