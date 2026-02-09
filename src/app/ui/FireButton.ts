import { FancyButton } from "@pixi/ui";
import { Graphics } from "pixi.js";

import { Label } from "./Label";

const SIZE = 72;
const RADIUS = SIZE / 2;

function createFireButtonView(fillColor: number, alpha: number) {
  return new Graphics()
    .roundRect(0, 0, SIZE, SIZE, RADIUS)
    .fill({ color: fillColor, alpha })
    .roundRect(0, 0, SIZE, SIZE, RADIUS)
    .stroke({ width: 2, color: 0x00ffff });
}

/**
 * Circular fire button for mobile touch devices.
 * Position bottom-right; use isMobile() to show only on touch devices.
 */
export class FireButton extends FancyButton {
  constructor() {
    super({
      defaultView: createFireButtonView(0x0a0a2e, 0.9),
      hoverView: createFireButtonView(0x16213e, 0.95),
      pressedView: createFireButtonView(0x0d1b2a, 0.95),
      anchor: 0.5,
      text: new Label({
        text: "FIRE",
        style: {
          fill: 0x00ffff,
          align: "center",
          fontSize: 14,
          fontWeight: "bold",
        },
      }),
      defaultTextAnchor: 0.5,
      scale: 0.95,
      animations: {
        hover: {
          props: { scale: { x: 1.05, y: 1.05 } },
          duration: 80,
        },
        pressed: {
          props: { scale: { x: 0.92, y: 0.92 } },
          duration: 80,
        },
      },
    });

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  /** Screen-space bounds for touch hit testing: { left, top, right, bottom } */
  getTouchBounds(
    w: number,
    h: number,
  ): { left: number; top: number; right: number; bottom: number } {
    const margin = 24;
    const half = SIZE / 2;
    const cx = w - margin - half;
    const cy = h - margin - half;
    return {
      left: cx - half,
      top: cy - half,
      right: cx + half,
      bottom: cy + half,
    };
  }
}

/** Detect touch-capable devices (mobile, tablets) */
export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/** Mobile viewport breakpoint - show control buttons only below this width */
const MOBILE_BREAKPOINT = 768;

/** True when in mobile mode (small viewport) - control buttons shown only then */
export function isMobileMode(width?: number): boolean {
  const w = width ?? window.innerWidth;
  return w < MOBILE_BREAKPOINT;
}
