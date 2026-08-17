'use strict';

// Durable guard: any K-line display/indicator/lock interaction added to the
// special panel must be mirrored in the shared comprehensive zodiac/tail chart.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const defaultPath = path.join(__dirname, '..', 'index.html');
let html;
if (fs.existsSync(defaultPath)) html = fs.readFileSync(defaultPath, 'utf8');
else {
  const { patchHtml } = require('./sync_comprehensive_chart.js');
  const base = fs.readFileSync(path.join(__dirname, 'macau-kline-base-227.html'), 'utf8');
  const special = fs.readFileSync(path.join(__dirname, 'special_binary_panel_v4.html'), 'utf8');
  html = patchHtml(base).replace('    <div id="macau-kline-inline-root"></div>', special + '\n    <div id="macau-kline-inline-root"></div>');
}
const count = needle => html.split(needle).length - 1;

assert.strictEqual(count('function Gt({draws, data, fullData,'), 1, 'shared zodiac/tail chart component');
assert.strictEqual(count('const kdj = (0, _.useMemo)'), 1, 'comprehensive KDJ engine');
assert.strictEqual(count('const [crosshairValue, setCrosshairValue]'), 1, 'comprehensive crosshair state');
assert.strictEqual(count('function kdj(series)'), 1, 'special KDJ engine');
assert.strictEqual(count('function drawLockedCrosshair('), 1, 'special crosshair renderer');
assert.ok(html.includes('fullChartData=je?[...xe,je]:xe'), 'all indicators must preheat on the cutoff-safe full prefix');
assert.ok(html.includes('const indicatorSource = fullData && fullData.length ? fullData : data'), 'comprehensive BOLL/MACD/KDJ use one safe prefix');
assert.ok(html.includes("children: '布林带'") && html.includes("children: '均线'"), 'comprehensive main indicator choices');
assert.ok(html.includes("children: 'MACD'") && html.includes("children: 'KDJ'") && html.includes("children: '强度／遗漏'"), 'comprehensive lower indicator choices');
assert.ok(html.includes('data-smp-lower="macd" aria-pressed="true">MACD</button>'), 'special MACD choice');
assert.ok(html.includes('data-smp-lower="kdj" aria-pressed="false">KDJ</button>'), 'special KDJ choice');
assert.ok(html.includes('data-smp-lower="omission" aria-pressed="false">强度／遗漏</button>'), 'special omission choice');
assert.strictEqual(count('chartStageDouble'), 0, 'comprehensive has one fixed lower slot');
assert.strictEqual(count('smp-double-lower'), 0, 'special has one fixed lower slot');
assert.strictEqual(count('MACD＋KDJ'), 0, 'MACD and KDJ never render as one combined option');
assert.ok(html.includes('macau-main-overlay') && html.includes('macau-main-lower'), 'comprehensive selections persist');
assert.ok(html.includes('macau-special-overlay') && html.includes('macau-special-lower'), 'special selections persist');
assert.ok(html.includes("ctx.setLineDash([3, 4])") && html.includes('ctx.setLineDash([3,4])'), 'both crosshair vertical guides');
assert.ok(html.includes("ctx.setLineDash([6, 4])") && html.includes('ctx.setLineDash([6,4])'), 'both crosshair horizontal guides');
assert.ok(html.includes('Date.now() - pending.time > 500') && html.includes('Date.now()-start.time>500'), 'both mobile tap-duration guards');
assert.ok(html.includes('Math.hypot(event.clientX - pending.x, event.clientY - pending.y) > 8') && html.includes('dragX*dragX+dragY*dragY>64'), 'both mobile drag guards');

console.log(JSON.stringify({
  status: 'passed',
  comprehensiveModes: ['zodiac', 'tail'],
  mirroredFeatures: ['two indicator slots', 'KDJ(9,3,3)', 'locked crosshair', 'touch tap guard']
}));
