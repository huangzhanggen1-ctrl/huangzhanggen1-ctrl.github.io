'use strict';
const assert = require('assert');
const spec = require('./classification-spec');

const results = spec.validateAll();
assert(results.length >= 13, 'Expected fixed and annual partitions to be validated');

for (const family of Object.keys(spec.FIXED)) {
  for (let n = 1; n <= 49; n++) {
    const label = spec.classifyFixed(family, n);
    assert(label, `${family}: ${n} missing classification`);
  }
}
for (const year of Object.keys(spec.FIVE_ELEMENTS)) {
  for (let n = 1; n <= 49; n++) {
    const label = spec.classifyFiveElement(year, n);
    assert(label, `fiveElements-${year}: ${n} missing classification`);
  }
}

// Regression sentinels for known boundaries and source-table values.
assert.equal(spec.classifyFixed('middleEdge', 12), '边数');
assert.equal(spec.classifyFixed('middleEdge', 13), '中数');
assert.equal(spec.classifyFixed('middleEdge', 37), '中数');
assert.equal(spec.classifyFixed('middleEdge', 38), '边数');
assert.equal(spec.classifyFixed('wave', 31), '蓝波');
assert.equal(spec.classifyFixed('wave', 32), '绿波');
assert.equal(spec.classifyFixed('head', 9), '0头');
assert.equal(spec.classifyFixed('head', 10), '1头');
assert.equal(spec.classifyFixed('head', 49), '4头');
assert.equal(spec.classifyFixed('innerOuter', 9), '内围码');
assert.equal(spec.classifyFixed('innerOuter', 1), '外围码');
assert.equal(spec.classifyFiveElement(2026, 1), '水');
assert.equal(spec.classifyFiveElement(2026, 49), '火');
assert.equal(spec.classifyFiveElement(2025, 49), '土');
assert.equal(spec.classifyFiveElement(2024, 41), '金');
assert.equal(spec.classifyFiveElement(2023, 49), '水');

console.log(JSON.stringify({ ok: true, validated: results }, null, 2));
