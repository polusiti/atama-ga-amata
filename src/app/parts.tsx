import type { ReactNode } from "react";

/** 12 x 10 pixel pumpkin. o = orange, k = black, g = green. */
const PUMPKIN = [
  "....gg......",
  "...gg.......",
  "..oooooooo..",
  ".oooooooooo.",
  "oooooooooooo",
  "ooookooookoo",
  "oooooookoooo",
  "ooookkkkkkoo",
  ".oooooooooo.",
  "..oooooooo..",
];
const PIXEL_COLOR: Record<string, string> = { o: "#ff8a1f", k: "#1a1a1a", g: "#3a8a2a" };

/**
 * 16 x 20 pixel ghost wearing the pumpkin as a hat. w = body, o = pumpkin, k = black, g = stem.
 * An original drawing of a ghost, a common Halloween figure. It is not the Kiro logo.
 */
const MASCOT = [
  "......gg........",
  ".....gg.........",
  "....oooooooo....",
  "...oooooooooo...",
  "..oooooooooooo..",
  "..oooooooooooo..",
  "..oookooookooo..",
  "..oooookkooooo..",
  "...oooooooooo...",
  "....oooooooo....",
  "...wwwwwwwwww...",
  "..wwwwwwwwwwww..",
  ".wwwwwwwwwwwwww.",
  ".wwwkkwwwwkkwww.",
  ".wwwkkwwwwkkwww.",
  ".wwwwwwwwwwwwww.",
  ".wwwwwwkkwwwwww.",
  ".wwwwwwwwwwwwww.",
  ".wwwwwwwwwwwwww.",
  ".www..wwww..www.",
];
const MASCOT_COLOR: Record<string, string> = { ...PIXEL_COLOR, w: "#f4f1ff" };
export function Mascot({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={(size * 16) / 20}
      height={size}
      viewBox="0 0 16 20"
      aria-hidden="true"
      shapeRendering="crispEdges"
      style={{
        imageRendering: "pixelated",
        // A thin dark outline, so the pale body does not dissolve into the grey window.
        filter:
          "drop-shadow(1px 0 0 #2b2b3a) drop-shadow(-1px 0 0 #2b2b3a) drop-shadow(0 1px 0 #2b2b3a) drop-shadow(0 -1px 0 #2b2b3a)",
      }}
    >
      {MASCOT.flatMap((row, y) =>
        [...row].map((c, x) =>
          MASCOT_COLOR[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={MASCOT_COLOR[c]} /> : null,
        ),
      )}
    </svg>
  );
}
export function Pumpkin({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 10) / 12}
      viewBox="0 0 12 10"
      aria-hidden="true"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {PUMPKIN.flatMap((row, y) =>
        [...row].map((c, x) =>
          PIXEL_COLOR[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PIXEL_COLOR[c]} /> : null,
        ),
      )}
    </svg>
  );
}

interface FrameProps {
  title: string;
  menu: readonly string[];
  address: string;
  addressLabel: string;
  toolbar: {
    back: { label: string; onClick: () => void; disabled: boolean };
    forward: { label: string };
    stop: { label: string };
    refresh: { label: string; onClick: () => void };
    home: { label: string; onClick: () => void };
  };
  onClose: () => void;
  statusLeft: string;
  statusMid: string;
  statusRight: string;
  children: ReactNode;
}

/** A late-90s browser window: menu bar, toolbar, address bar, page area, status bar. */
export function BrowserFrame(p: FrameProps) {
  return (
    <div className="window win">
      <div className="title-bar">
        <div className="title-bar-text">{p.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" disabled />
          <button aria-label="Maximize" disabled />
          <button aria-label="Close" onClick={p.onClose} />
        </div>
      </div>
      <div className="window-body browser">
        <div className="menubar" aria-hidden="true">
          {p.menu.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="toolbar">
          <button onClick={p.toolbar.back.onClick} disabled={p.toolbar.back.disabled}>
            {p.toolbar.back.label}
          </button>
          <button disabled>{p.toolbar.forward.label}</button>
          <button disabled>{p.toolbar.stop.label}</button>
          <button onClick={p.toolbar.refresh.onClick}>{p.toolbar.refresh.label}</button>
          <button onClick={p.toolbar.home.onClick}>{p.toolbar.home.label}</button>
        </div>
        <div className="addressbar">
          <label htmlFor="addr">{p.addressLabel}</label>
          <input id="addr" type="text" readOnly value={p.address} />
        </div>
        <div className="page sunken-panel">{p.children}</div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{p.statusLeft}</p>
        <p className="status-bar-field">{p.statusMid}</p>
        <p className="status-bar-field" style={{ flexGrow: 0, minWidth: 110 }}>
          {p.statusRight}
        </p>
      </div>
    </div>
  );
}
