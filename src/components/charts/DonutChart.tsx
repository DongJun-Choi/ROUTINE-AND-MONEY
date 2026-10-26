import type { ReactNode } from "react";

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
}

const RADIUS = 78;
const STROKE_WIDTH = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// 이웃한 조각을 색만으로 나누지 않도록 조각 사이에 2px 틈을 둔다.
const SEGMENT_GAP = 2;

export default function DonutChart({ segments, ariaLabel, className = "", children }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const gap = segments.length > 1 ? SEGMENT_GAP : 0;
  const arcs = segments.reduce<{ key: string; color: string; length: number; offset: number }[]>((list, segment) => {
    const previous = list[list.length - 1];
    const offset = previous ? previous.offset + previous.length : 0;
    return [...list, { key: segment.key, color: segment.color, length: total > 0 ? (segment.value / total) * CIRCUMFERENCE : 0, offset }];
  }, []);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label={ariaLabel}>
        <g transform="rotate(-90 100 100)" fill="none" strokeWidth={STROKE_WIDTH}>
          {total === 0 ? (
            <circle cx="100" cy="100" r={RADIUS} style={{ stroke: "var(--subtle)" }} />
          ) : (
            arcs.map((arc) => (
              <circle
                key={arc.key}
                cx="100"
                cy="100"
                r={RADIUS}
                strokeDasharray={`${Math.max(arc.length - gap, 0)} ${CIRCUMFERENCE}`}
                strokeDashoffset={-arc.offset}
                style={{ stroke: arc.color }}
              />
            ))
          )}
        </g>
      </svg>
      {children && <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">{children}</div>}
    </div>
  );
}
