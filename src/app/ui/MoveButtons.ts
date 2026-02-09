import { FancyButton } from "@pixi/ui";
import { Container, Graphics } from "pixi.js";

import { Label } from "./Label";

export const MOVE_BUTTON_SIZE = 56;
export const MOVE_BUTTON_GAP = 12;
export const MOVE_BUTTON_MARGIN = 24;

const SIZE = MOVE_BUTTON_SIZE;
const GAP = MOVE_BUTTON_GAP;
const RADIUS = SIZE / 2;

function createMoveButtonView(fillColor: number, alpha: number) {
  return new Graphics()
    .roundRect(0, 0, SIZE, SIZE, RADIUS)
    .fill({ color: fillColor, alpha })
    .roundRect(0, 0, SIZE, SIZE, RADIUS)
    .stroke({ width: 2, color: 0x00ffff });
}

/**
 * Left/right move buttons for touch devices.
 * Positioned bottom-left; player sits on horizontal line above both buttons.
 */
export class MoveButtons extends Container {
  public readonly leftButton: FancyButton;
  public readonly rightButton: FancyButton;

  constructor() {
    super();

    this.leftButton = new FancyButton({
      defaultView: createMoveButtonView(0x0a0a2e, 0.9),
      hoverView: createMoveButtonView(0x16213e, 0.95),
      pressedView: createMoveButtonView(0x0d1b2a, 0.95),
      anchor: 0.5,
      text: new Label({
        text: "←",
        style: {
          fill: 0x00ffff,
          align: "center",
          fontSize: 20,
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
    this.leftButton.eventMode = "static";
    this.leftButton.cursor = "pointer";
    this.leftButton.x = RADIUS;
    this.leftButton.y = RADIUS;
    this.addChild(this.leftButton);

    this.rightButton = new FancyButton({
      defaultView: createMoveButtonView(0x0a0a2e, 0.9),
      hoverView: createMoveButtonView(0x16213e, 0.95),
      pressedView: createMoveButtonView(0x0d1b2a, 0.95),
      anchor: 0.5,
      text: new Label({
        text: "→",
        style: {
          fill: 0x00ffff,
          align: "center",
          fontSize: 20,
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
    this.rightButton.eventMode = "static";
    this.rightButton.cursor = "pointer";
    this.rightButton.x = SIZE + GAP + RADIUS;
    this.rightButton.y = RADIUS;
    this.addChild(this.rightButton);
  }

  /** Width of the button group (for centering player) */
  get width(): number {
    return SIZE * 2 + GAP;
  }

  /** Height of the button group */
  get height(): number {
    return SIZE;
  }

  /** Screen-space bounds for touch hit testing */
  getLeftTouchBounds(h: number): {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } {
    const half = SIZE / 2;
    const cx = MOVE_BUTTON_MARGIN + half;
    const cy = h - MOVE_BUTTON_MARGIN - half;
    return {
      left: cx - half,
      top: cy - half,
      right: cx + half,
      bottom: cy + half,
    };
  }

  getRightTouchBounds(h: number): {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } {
    const half = SIZE / 2;
    const cx = MOVE_BUTTON_MARGIN + SIZE + GAP + half;
    const cy = h - MOVE_BUTTON_MARGIN - half;
    return {
      left: cx - half,
      top: cy - half,
      right: cx + half,
      bottom: cy + half,
    };
  }
}
