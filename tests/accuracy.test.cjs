const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const typescript = require('typescript');

const metricsPath = path.join(__dirname, '..', 'src', 'lib', 'metrics.ts');
const metricsSource = fs.readFileSync(metricsPath, 'utf8');
const compiledMetrics = typescript.transpileModule(metricsSource, {
  compilerOptions: { module: typescript.ModuleKind.CommonJS },
}).outputText;
const metricsModule = { exports: {} };
new Function('exports', 'require', 'module', compiledMetrics)(
  metricsModule.exports,
  require,
  metricsModule,
);

const { calculateAccuracy, calculateAccuracyFromEvents } = metricsModule.exports;

test('counts correctly pressed spaces as correct inputs', () => {
  const events = [
    { k: 'a', c: true },
    { k: 'Space', c: true },
    { k: 'x', c: false },
  ];

  assert.equal(calculateAccuracyFromEvents(events, ['a', 'b']), 66.67);
});

test('keeps incorrect typed characters in the accuracy denominator', () => {
  assert.equal(calculateAccuracy(135, 136), 99.26);
});

test('keeps the displayed accuracy high when many spaces were correct', () => {
  const words = Array.from({ length: 27 }, () => 'aaaaa');
  const events = [];

  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    for (const _character of words[wordIndex]) {
      events.push({ k: 'a', c: true });
    }
    if (wordIndex < words.length - 1) {
      events.push({ k: 'Space', c: true });
    }
  }
  events.push({ k: 'x', c: false });

  assert.equal(calculateAccuracyFromEvents(events, words), 99.38);
});

test('returns 100 percent when no inputs were typed', () => {
  assert.equal(calculateAccuracy(0, 0, 0), 100);
});

test('recalculates accuracy from final characters after a backspace', () => {
  const events = [
    { k: 'x', c: false },
    { k: 'Backspace', c: true },
    { k: 'a', c: true },
    { k: 'Space', c: true },
    { k: 'b', c: true },
  ];

  assert.equal(calculateAccuracyFromEvents(events, ['a', 'b']), 100);
});

test('counts a correctly typed space but not a missed character', () => {
  const events = [
    { k: 'a', c: true },
    { k: 'Space', c: true },
    { k: 'x', c: false },
    { k: 'Space', c: true },
  ];

  assert.equal(calculateAccuracyFromEvents(events, ['a', 'bc']), 75);
});

test('removes cleared and backspaced characters from final accuracy', () => {
  const events = [
    { k: 'a', c: true },
    { k: 'x', c: false },
    { k: 'ClearWord', c: true },
    { k: 'a', c: true },
    { k: 'x', c: false },
    { k: 'Backspace', c: true },
    { k: 'b', c: true },
    { k: 'Space', c: true },
  ];

  assert.equal(calculateAccuracyFromEvents(events, ['ab']), 100);
});

test('preserves counted spaces when backspace returns to a previous word', () => {
  const events = [
    { k: 'x', c: false },
    { k: 'Space', c: true },
    { k: 'Backspace', c: true },
    { k: 'Backspace', c: true },
    { k: 'a', c: true },
    { k: 'Space', c: true },
    { k: 'b', c: true },
  ];

  assert.equal(calculateAccuracyFromEvents(events, ['a', 'b']), 100);
});
