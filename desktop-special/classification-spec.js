'use strict';

// Final-member classification specification.
// Fixed-number families are immutable. Annual families are explicitly versioned.
const RANGE_49 = Array.from({ length: 49 }, (_, i) => i + 1);
const set = (...values) => Object.freeze(values.flat());

const FIXED = Object.freeze({
  wave: Object.freeze({
    红波: set(1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46),
    蓝波: set(3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48),
    绿波: set(5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49)
  }),
  head: Object.freeze({
    '0头': set(1,2,3,4,5,6,7,8,9),
    '1头': set(10,11,12,13,14,15,16,17,18,19),
    '2头': set(20,21,22,23,24,25,26,27,28,29),
    '3头': set(30,31,32,33,34,35,36,37,38,39),
    '4头': set(40,41,42,43,44,45,46,47,48,49)
  }),
  middleEdge: Object.freeze({
    中数: Object.freeze(RANGE_49.filter(n => n >= 13 && n <= 37)),
    边数: Object.freeze(RANGE_49.filter(n => n <= 12 || n >= 38))
  }),
  heavenEarth: Object.freeze({
    天码: set(1,4,7,9,10,11,14,17,19,20,21,24,27,29,30,31,34,37,39,40,41,44,47,49),
    地码: set(2,3,5,6,8,12,13,15,16,18,22,23,25,26,28,32,33,35,36,38,42,43,45,46,48)
  }),
  highLow: Object.freeze({
    高码: set(1,4,7,8,9,10,12,17,18,19,25,26,27,28,29,30,34,35,36,37,39,44,45,47,48),
    低码: set(2,3,5,6,11,13,14,15,16,20,21,22,23,24,31,32,33,38,40,41,42,43,46,49)
  }),
  leftRight: Object.freeze({
    左边码: set(1,2,3,4,8,9,10,11,15,16,17,18,22,23,24,29,30,31,36,37,38,43,44,45),
    右边码: set(5,6,7,12,13,14,19,20,21,25,26,27,28,32,33,34,35,39,40,41,42,46,47,48,49)
  }),
  innerOuter: Object.freeze({
    内围码: set(9,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30,31,32,33,34,37,38,39,40,41),
    外围码: set(1,2,3,4,5,6,7,8,14,15,21,22,28,29,35,36,42,43,44,45,46,47,48,49)
  }),
  frontBack: Object.freeze({
    前码: set(1,2,3,4,5,6,7,8,17,18,19,20,21,22,23,24,33,34,35,36,37,38,39,40),
    后码: set(9,10,11,12,13,14,15,16,25,26,27,28,29,30,31,32,41,42,43,44,45,46,47,48,49)
  })
});

// Annual five-element tables are versioned; old K-lines must store the version used at settlement.
const FIVE_ELEMENTS = Object.freeze({
  2022: Object.freeze({
    金: set(4,5,18,19,26,27,34,35,48,49),
    木: set(1,8,9,16,17,30,31,38,39,46,47),
    水: set(6,7,14,15,22,23,36,37,44,45),
    火: set(2,3,10,11,24,25,32,33,40,41),
    土: set(12,13,20,21,28,29,42,43)
  }),
  2023: Object.freeze({
    金: set(1,2,9,10,23,24,31,32,39,40),
    木: set(5,6,13,14,21,22,35,36,43,44),
    水: set(11,12,19,20,27,28,41,42,49),
    火: set(7,8,15,16,29,30,37,38,45,46),
    土: set(3,4,17,18,25,26,33,34,47,48)
  }),
  2024: Object.freeze({
    金: set(2,3,10,11,24,25,32,33,40,41),
    木: set(6,7,14,15,22,23,36,37,44,45),
    水: set(12,13,20,21,28,29,42,43),
    火: set(1,8,9,16,17,30,31,38,39,46,47),
    土: set(4,5,18,19,26,27,34,35,48,49)
  }),
  2025: Object.freeze({
    金: set(3,4,11,12,25,26,33,34,41,42),
    木: set(7,8,15,16,23,24,37,38,45,46),
    水: set(13,14,21,22,29,30,43,44),
    火: set(1,2,9,10,17,18,31,32,39,40,47,48),
    土: set(5,6,19,20,27,28,35,36,49)
  }),
  2026: Object.freeze({
    金: set(4,5,12,13,26,27,34,35,42,43),
    木: set(8,9,16,17,24,25,38,39,46,47),
    水: set(1,14,15,22,23,30,31,44,45),
    火: set(2,3,10,11,18,19,32,33,40,41,48,49),
    土: set(6,7,20,21,28,29,36,37)
  })
});

const familyMeta = Object.freeze({
  wave: { title: '波色', values: ['红波','蓝波','绿波'], policy: 'fixed' },
  head: { title: '头数', values: ['0头','1头','2头','3头','4头'], policy: 'fixed' },
  middleEdge: { title: '中边数', values: ['中数','边数'], policy: 'fixed' },
  heavenEarth: { title: '天地码', values: ['天码','地码'], policy: 'fixed' },
  highLow: { title: '高低码', values: ['高码','低码'], policy: 'fixed' },
  leftRight: { title: '左右码', values: ['左边码','右边码'], policy: 'fixed' },
  innerOuter: { title: '内外码', values: ['内围码','外围码'], policy: 'fixed' },
  frontBack: { title: '前后码', values: ['前码','后码'], policy: 'fixed' },
  fiveElements: { title: '五行', values: ['金','木','水','火','土'], policy: 'annual-freeze' }
});

function classifyFixed(family, number) {
  const n = Number(number);
  const table = FIXED[family];
  if (!table || !Number.isInteger(n) || n < 1 || n > 49) return null;
  for (const [label, numbers] of Object.entries(table)) if (numbers.includes(n)) return label;
  return null;
}

function classifyFiveElement(year, number) {
  const y = Number(year), n = Number(number), table = FIVE_ELEMENTS[y];
  if (!table || !Number.isInteger(n) || n < 1 || n > 49) return null;
  for (const [label, numbers] of Object.entries(table)) if (numbers.includes(n)) return label;
  return null;
}

function validatePartition(name, table) {
  const seen = new Map();
  const duplicates = [];
  const invalid = [];
  for (const [label, numbers] of Object.entries(table)) {
    for (const raw of numbers) {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 1 || n > 49) invalid.push({ label, number: raw });
      if (seen.has(n)) duplicates.push({ number: n, first: seen.get(n), second: label });
      else seen.set(n, label);
    }
  }
  const missing = RANGE_49.filter(n => !seen.has(n));
  if (invalid.length || duplicates.length || missing.length) {
    const err = new Error(`${name} partition invalid`);
    err.details = { invalid, duplicates, missing };
    throw err;
  }
  return { family: name, count: seen.size, groups: Object.keys(table).length };
}

function validateAll() {
  const results = [];
  for (const [name, table] of Object.entries(FIXED)) results.push(validatePartition(name, table));
  for (const [year, table] of Object.entries(FIVE_ELEMENTS)) results.push(validatePartition(`fiveElements-${year}`, table));
  return results;
}

module.exports = { RANGE_49, FIXED, FIVE_ELEMENTS, familyMeta, classifyFixed, classifyFiveElement, validatePartition, validateAll };
