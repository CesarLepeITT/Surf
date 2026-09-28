import test from 'node:test';import assert from 'node:assert/strict';import { readFileSync, readdirSync, existsSync } from 'node:fs';

const source=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const assets=[...source.match(/const ASSETS=\[(.*?)\]/s)[1].matchAll(/'([^']+)'/g)].map(match=>match[1]);

test('precaches every module that src/ ships',()=>{for(const asset of assets)assert.ok(existsSync(new URL(`..${asset}`,import.meta.url)),`no existe ${asset}`);const missing=readdirSync(new URL('../src',import.meta.url)).filter(file=>file.endsWith('.js')&&!assets.includes(`/src/${file}`));assert.deepEqual(missing,[],`fuera de la caché: ${missing.join(', ')}`);});
test('takes control immediately and drops superseded caches',()=>{assert.match(source,/skipWaiting\(\)/);assert.match(source,/caches\.keys\(\)/);assert.match(source,/caches\.delete/);assert.match(source,/clients\.claim\(\)/);});
test('asks the network first so an update lands without a cache bump',()=>{assert.ok(source.indexOf('await fetch(')<source.indexOf('caches.match('),'debe consultar la red antes de la caché');assert.match(source,/request\.mode==='navigate'/);});
test('ignores cross-origin and non-GET requests',()=>{assert.match(source,/e\.request\.method==='GET'/);assert.match(source,/url\.origin===self\.location\.origin/);});
