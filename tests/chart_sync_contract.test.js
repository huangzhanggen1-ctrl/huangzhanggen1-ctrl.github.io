'use strict';

// Durable guard: any K-line display/indicator/lock interaction added to the
// special panel must be mirrored in the shared comprehensive zodiac/tail chart.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const count = needle => html.split(needle).length - 1;

assert.strictEqual(count('function Gt({draws, data, fullData,'), 1, 'shared zodiac/tail chart component');
assert.strictEqual(count('const kdj = (0, _.useMemo)'), 1, 'comprehensive KDJ engine');
assert.strictEqual(count('const [crosshairValue, setCrosshairValue]'), 1, 'comprehensive crosshair state');
assert.strictEqual(count('function kdj(series)'), 1, 'special KDJ engine');
assert.strictEqual(count('function drawLockedCrosshair('), 1, 'special crosshair renderer');
assert.ok(html.includes('fullChartData=je?[...xe,je]:xe'), 'KDJ must preheat on the cutoff-safe full prefix');
assert.ok(html.includes("children: 'MACD＋KDJ'"), 'comprehensive MACD+KDJ control');
assert.ok(html.includes('data-smp-lower="macd" aria-pressed="true">MACD＋KDJ</button>'), 'special MACD+KDJ control');
assert.ok(html.includes('chartStage chartStageDouble'), 'comprehensive stacked lower panels');
assert.ok(html.includes('smp-double-lower'), 'special stacked lower panels');
assert.ok(html.includes("ctx.setLineDash([3, 4])") && html.includes('ctx.setLineDash([3,4])'), 'both crosshair vertical guides');
assert.ok(html.includes("ctx.setLineDash([6, 4])") && html.includes('ctx.setLineDash([6,4])'), 'both crosshair horizontal guides');
assert.ok(html.includes('Date.now() - pending.time > 500') && html.includes('Date.now()-start.time>500'), 'both mobile tap-duration guards');
assert.ok(html.includes('Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 8') && html.includes('dragX*dragX+dragY*dragY>64'), 'both mobile drag guards');

console.log(JSON.stringify({
  status: 'passed',
  comprehensiveModes: ['zodiac', 'tail'],
  mirroredFeatures: ['KDJ(9,3,3)', 'locked crosshair', 'touch tap guard']
}));
