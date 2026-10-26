export interface BarChartDatum {
  key: string;
  label: string;
  value: number;
  highlight?: boolean;
  valueLabel?: string;
  tooltip?: string;
}

interface BarChartProps {
  data: BarChartDatum[];
  ariaLabel: string;
  height: number;
  gap: number;
  barWidth: string;
  barMaxWidth: number;
  formatTick: (value: number) => string;
  highlightLabels?: boolean;
  hideMinorValuesOnMobile?: boolean;
}

const AXIS_WIDTH = 44;
const AXIS_INTERVALS = 3;

// 눈금이 1·2·2.5·5 단위의 깔끔한 금액으로 끊기도록 최댓값을 올림한다.
export function niceAxisMax(maxValue: number, intervals = AXIS_INTERVALS): number {
  if (maxValue <= 0) return 0;
  const rawStep = maxValue / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rawStep) ?? 10 * magnitude;
  return step * intervals;
}

export default function BarChart({ data, ariaLabel, height, gap, barWidth, barMaxWidth, formatTick, highlightLabels = false, hideMinorValuesOnMobile = false }: BarChartProps) {
  const max = niceAxisMax(Math.max(0, ...data.map((datum) => datum.value)));
  const step = max / AXIS_INTERVALS;
  const ticks = max > 0 ? [3, 2, 1].map((multiple) => step * multiple) : [];

  return (
    <div role="img" aria-label={ariaLabel} className="flex flex-col pt-6">
      <div className="relative flex items-end border-b border-line-strong" style={{ height, marginLeft: AXIS_WIDTH, gap }}>
        {ticks.map((tick) => (
          <div key={tick} aria-hidden="true" className="absolute inset-x-0 border-t border-dashed border-line" style={{ top: `${(1 - tick / max) * 100}%` }}>
            <span className="absolute -top-2 text-right text-[11px] leading-4 text-muted" style={{ left: -AXIS_WIDTH, width: AXIS_WIDTH - 8 }}>{formatTick(tick)}</span>
          </div>
        ))}
        <span aria-hidden="true" className="absolute -bottom-2 text-right text-[11px] leading-4 text-muted" style={{ left: -AXIS_WIDTH, width: AXIS_WIDTH - 8 }}>0</span>
        {data.map((datum) => {
          const barHeight = datum.value > 0 && max > 0 ? `${((datum.value / max) * 100).toFixed(2)}%` : "2px";
          const barColor = datum.value <= 0 ? "bg-line" : datum.highlight ? "bg-bar-current" : "bg-bar-default";
          return (
            <div key={datum.key} className="relative flex h-full min-w-0 flex-1 items-end justify-center">
              {datum.valueLabel && (
                <span
                  aria-hidden="true"
                  className={`absolute text-[11px] leading-[14px] whitespace-nowrap ${datum.highlight ? "font-bold text-primary-text" : "font-medium text-muted"} ${hideMinorValuesOnMobile && !datum.highlight ? "hidden sm:inline" : ""}`}
                  style={{ bottom: `calc(${barHeight} + 6px)` }}
                >
                  {datum.valueLabel}
                </span>
              )}
              {datum.tooltip && (
                <span aria-hidden="true" className="absolute z-10 rounded-md bg-tooltip px-2 py-[5px] text-[11px] leading-[14px] font-semibold whitespace-nowrap text-tooltip-text" style={{ bottom: `calc(${barHeight} + 8px)` }}>
                  {datum.tooltip}
                </span>
              )}
              <div className={`rounded-t-[4px] ${barColor}`} style={{ width: barWidth, maxWidth: barMaxWidth, height: barHeight }} />
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="flex pt-2" style={{ marginLeft: AXIS_WIDTH, gap }}>
        {data.map((datum) => (
          <span key={datum.key} className={`min-w-0 flex-1 text-center text-[11px] whitespace-nowrap sm:text-xs ${highlightLabels && datum.highlight ? "font-bold text-primary-text" : "font-medium text-muted"}`}>
            {datum.label}
          </span>
        ))}
      </div>
    </div>
  );
}
