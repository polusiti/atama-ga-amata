interface Props {
  /** Angle between the two points on the great circle, in radians. Half the Fisher-Rao distance. */
  theta: number;
  startLabel: string;
  nowLabel: string;
  limitLabel: string;
  ariaLabel: string;
}

const W = 240;
const H = 158;
const CX = 28;
const CY = 136;
const R = 112;

const point = (a: number) => ({ x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) });

/**
 * Two beliefs, seen as points on the unit sphere (p -> sqrt p), always lie in one plane through the
 * sphere's center. In that plane the shortest path between them is an arc of a circle, so this
 * drawing is not a projection: the arc angle is exactly half the Fisher-Rao distance. The dotted
 * quarter circle marks the largest possible distance (no overlap at all).
 */
export function GeodesicPlot({ theta, startLabel, nowLabel, limitLabel, ariaLabel }: Props) {
  const a0 = point(0);
  const a1 = point(Math.min(theta, Math.PI / 2));
  const mid = point(Math.min(theta, Math.PI / 2) / 2);
  const lim = point(Math.PI / 2);
  const large = 0; // arcs here are at most a quarter circle

  return (
    <svg className="geoplot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      <rect x="0" y="0" width={W} height={H} fill="#fffdf2" />
      {/* the quarter circle of all possible distances */}
      <path d={`M ${a0.x} ${a0.y} A ${R} ${R} 0 ${large} 0 ${lim.x} ${lim.y}`} fill="none" stroke="#9a9a9a" strokeDasharray="3 3" />
      <line x1={CX} y1={CY} x2={a0.x} y2={a0.y} stroke="#bdbdbd" />
      <line x1={CX} y1={CY} x2={lim.x} y2={lim.y} stroke="#bdbdbd" strokeDasharray="3 3" />
      <line x1={CX} y1={CY} x2={a1.x} y2={a1.y} stroke="#bdbdbd" />
      {/* the geodesic between the two beliefs */}
      {theta > 1e-6 && (
        <path
          d={`M ${a0.x} ${a0.y} A ${R} ${R} 0 ${large} 0 ${a1.x} ${a1.y}`}
          fill="none"
          stroke="#cc6600"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      <circle cx={a0.x} cy={a0.y} r="5" fill="#006699" />
      <circle cx={a1.x} cy={a1.y} r="5" fill="#cc0000" />
      {theta > 1e-6 && <rect x={mid.x - 3} y={mid.y - 3} width="6" height="6" fill="#fff" stroke="#333" transform={`rotate(45 ${mid.x} ${mid.y})`} />}
      <text x={a0.x - 4} y={a0.y + 16} fontSize="11" textAnchor="end" fill="#006699">
        {startLabel}
      </text>
      {/* "now" sits to the right of its dot; the limit label sits above the top of the dotted line, so they never collide. */}
      <text x={a1.x + 9} y={a1.y + 4} fontSize="11" textAnchor={a1.x + 9 > W - 60 ? "end" : "start"} fill="#cc0000">
        {nowLabel}
      </text>
      <text x={lim.x + 6} y={11} fontSize="10" fill="#777">
        {limitLabel}
      </text>
    </svg>
  );
}
