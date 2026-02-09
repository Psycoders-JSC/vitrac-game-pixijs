export function resize(
  w: number,
  h: number,
  minWidth: number,
  minHeight: number,
  letterbox: boolean,
) {
  if (w <= 0 || h <= 0) {
    return {
      width: minWidth,
      height: minHeight,
      displayWidth: minWidth,
      displayHeight: minHeight,
    };
  }
  const aspectRatio = minWidth / minHeight;
  let canvasWidth = w;
  let canvasHeight = h;

  if (letterbox) {
    const heightIfFullWidth = w / aspectRatio;
    if (heightIfFullWidth <= h) {
      canvasWidth = w;
      canvasHeight = Math.floor(w / aspectRatio);
    } else {
      canvasHeight = h;
      canvasWidth = Math.floor(h * aspectRatio);
    }
  }

  const scaleX = canvasWidth < minWidth ? minWidth / canvasWidth : 1;
  const scaleY = canvasHeight < minHeight ? minHeight / canvasHeight : 1;
  const scale = scaleX > scaleY ? scaleX : scaleY;
  const width = Math.floor(canvasWidth * scale);
  const height = Math.floor(canvasHeight * scale);

  return {
    width,
    height,
    displayWidth: canvasWidth,
    displayHeight: canvasHeight,
  };
}
