import test from 'node:test';
import assert from 'node:assert/strict';

function computeSphereParams(w: number, h: number) {
  const hr = w <= 380 ? 0.38 : w <= 640 ? 0.42 : 0.46;
  const wr = w <= 380 ? 0.48 : w <= 640 ? 0.52 : 0.58;
  const floor = w <= 380 ? 108 : w <= 640 ? 120 : 155;
  const R = Math.max(floor, Math.min(480, h * hr, w * wr));
  const scale = w <= 380 ? 0.44 : w <= 640 ? 0.46 : 0.47;
  const cw = Math.round(Math.max(72, R * scale));
  const persp = w <= 380 ? 620 : w <= 640 ? 760 : w <= 900 ? 920 : 1150;
  return { R, cw, persp };
}

function fibonacciSphere(n = 21) {
  const GA = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GA;
    const x = Math.cos(theta) * rad;
    const z = Math.sin(theta) * rad;
    const lat = Math.asin(y) * 180 / Math.PI;
    const lon = Math.atan2(x, z) * 180 / Math.PI;
    pts.push({ x, y, z, lat, lon });
  }
  return pts;
}

function computeDepth(x: number, y: number, z: number, sxDeg: number, syDeg: number) {
  const rx = sxDeg * Math.PI / 180;
  const ry = syDeg * Math.PI / 180;
  const py = -y;
  const z1 = py * Math.sin(rx) + z * Math.cos(rx);
  return -x * Math.sin(ry) + z1 * Math.cos(ry);
}

test('fibonacciSphere generates 21 unit vectors', () => {
  const pts = fibonacciSphere(21);
  assert.equal(pts.length, 21);
  assert.ok(Math.abs(pts[0].y - 1) < 1e-9);
  assert.ok(Math.abs(pts[20].y + 1) < 1e-9);
  for (const p of pts) {
    const len = Math.hypot(p.x, p.y, p.z);
    assert.ok(Math.abs(len - 1) < 1e-9);
  }
});

test('computeSphereParams respects desktop and mobile breakpoints', () => {
  const desktop = computeSphereParams(1440, 900);
  assert.equal(desktop.persp, 1150);
  assert.equal(desktop.R, 414);
  assert.equal(desktop.cw, Math.round(414 * 0.47));

  const mobile = computeSphereParams(390, 844);
  assert.equal(mobile.persp, 760);
  assert.equal(mobile.R, 390 * 0.52);

  const tiny = computeSphereParams(320, 568);
  assert.equal(tiny.persp, 620);
  assert.equal(tiny.R, 320 * 0.48);
});

test('computeDepth stays in [-1, 1] and tracks yaw/pitch', () => {
  const zFront = computeDepth(0, 0, 1, -4, 0);
  assert.ok(zFront > 0.99 && zFront <= 1);
  const zLeftRotatedFront = computeDepth(-1, 0, 0, 0, 90);
  assert.ok(Math.abs(zLeftRotatedFront - 1) < 1e-9);
});
