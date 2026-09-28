import test from 'node:test';import assert from 'node:assert/strict';import { formatSeconds } from '../src/timer.js';
test('formats countdowns consistently',()=>{assert.equal(formatSeconds(45),'00:45');assert.equal(formatSeconds(61),'01:01');assert.equal(formatSeconds(-3),'00:00');});
