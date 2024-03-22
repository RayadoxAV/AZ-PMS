export function drawArrow(context: CanvasRenderingContext2D, x: number, y: number, toX: number, toY: number, headLength: number) {
  const dx = toX - x;
  const dy = toY - y;

  const angle = Math.atan2(dy, dx);

  context.moveTo(x, y);
  context.lineTo(toX, toY);
  context.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
  context.moveTo(toX, toY);
  context.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
}
