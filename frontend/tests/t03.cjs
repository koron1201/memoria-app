/* eslint-disable @typescript-eslint/no-require-imports -- CJS harness for isolated TypeScript API execution. */
// Run: node tests/t03.cjs. No real AI or DB calls; actual API sources run in a VM.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const backend = path.resolve(root, '../backend');
const { harness } = require('./t03-harness.cjs');
const dates = harness('N').load(path.join(root,'src/lib/tanzaku-dates.ts'));
const validCases = [
 ['D02','2026-09-14','2026-09-14'],['D03','2026-09-14','2026-09-15'],['D04','2026-09-14','2026-09-21'],
 ['D05','2026-09-14','2026-12-06'],['D06a','2026-09-14','2026-12-07'],['D06b','2026-09-14','2026-12-08'],
 ['D07null','2026-09-14',null],['D07omit','2026-09-14',undefined],['D08','2026-09-30','2026-10-02'],
 ['D09','2026-12-31','2027-01-02'],['D10a','2028-02-28','2028-02-29'],['D10b','2028-02-28','2028-03-01']
];
function invariant(wish, start, end, count) {
 assert.equal(wish.steps.length,count);
 const ymd=wish.steps.map(s=>s.dueDate);
 assert.equal(ymd[0], start);
 assert.deepEqual(ymd, [...ymd].sort());
 ymd.forEach(d=>{assert.ok(dates.parseYmd(d)); assert.ok(d>=start); if(end)assert.ok(d<=end);});
 if(end) assert.equal(ymd.at(-1),end);
 else assert.equal(ymd.at(-1), new Date(new Date(start+'T00:00:00Z').getTime()+14*(count-1)*86400000).toISOString().slice(0,10));
}
test('H/N date policy sources remain identical',()=>assert.equal(fs.readFileSync(path.join(root,'src/lib/tanzaku-dates.ts'),'utf8'), fs.readFileSync(path.join(backend,'src/lib/tanzaku-dates.ts'),'utf8')));
for(const route of ['H','N']) {
 for(const mode of ['ai','missing']) for(const [id,start,end] of validCases) test(`${route} ${id} ${mode} POST/storage/GET`,async()=>{
   const h=harness(route,{date:start+'T03:00:00Z',mode});
   const {status,body}=await h.request('POST',{dream:'Test dream',deadline:end});
   assert.equal(status,201); invariant(body,start,end,7); assert.equal(body.deadline,end??null);
   assert.deepEqual(body.steps,h.records.get(body.id).roadmap_steps);
   assert.deepEqual((await h.request('GET',undefined,body.id)).body,body);
 });
 for(const bad of ['2026-09-13','2026-02-29','2026-02-30','2026-99-99','','2026/09/21','invalid',123]) test(`${route} D01/D11/D12 reject ${JSON.stringify(bad)}`,async()=>{
  const h=harness(route);const r=await h.request('POST',{dream:'Test',deadline:bad});assert.equal(r.status,400);assert.ok(r.body.error);assert.equal(h.records.size,0);
 });
 for(const count of [5,7,10]) test(`${route} D13 A01-A03 count ${count}`,async()=>{
  const h=harness(route,{count}); const r=await h.request('POST',{dream:'Test',deadline:'2026-09-21'}); assert.equal(r.status,201); invariant(r.body,'2026-09-14','2026-09-21',count);assert.ok(r.body.steps.every(s=>s.generationSource==='ai'));
 });
 for(const mode of ['missing','network','http','json']) test(`${route} A04/A05/A06 ${mode}`,async()=>{
  const h=harness(route,{mode});const r=await h.request('POST',{dream:'Test',deadline:'2026-09-14'});assert.equal(r.status,201);invariant(r.body,'2026-09-14','2026-09-14',7);assert.ok(r.body.steps.every(s=>s.generationSource==='fallback'));
 });
 for(const raw of [null,{}, {steps:Array(4).fill({})},{steps:Array(11).fill({})},{steps:[null,...Array(6).fill({})]}]) test(`${route} A05 malformed ${JSON.stringify(raw)}`,async()=>{
  const h=harness(route,{raw});const r=await h.request('POST',{dream:'Test',deadline:'2026-09-21'});assert.equal(r.status,201);const count=raw?.steps?.length===11?10:7;invariant(r.body,'2026-09-14','2026-09-21',count); assert.ok(r.body.steps.every(s=>s.generationSource===(count===10?'ai':'fallback')));
 });
 test(`${route} U01-U07 completion, undo, next-day, expired and historical data`,async()=>{
  const h=harness(route); let r=await h.request('POST',{dream:'Test',deadline:'2026-09-15'});const original=r.body; const id=original.id;
  r=await h.request('PATCH',{steps:original.steps.map(s=>({...s,done:true,dueDate:'2099-01-01'}))},id);
  assert.equal(r.body.status,'achieved');assert.deepEqual(r.body.steps.map(s=>s.dueDate),original.steps.map(s=>s.dueDate));assert.ok(r.body.achievedAt);
  const achieved=r.body;h.setClock('2027-01-01T00:00:00Z');assert.deepEqual((await h.request('GET',undefined,id)).body,achieved);
  r=await h.request('PATCH',{steps:original.steps},id);assert.equal(r.body.status,'active');assert.equal(r.body.achievedAt,null);assert.deepEqual(r.body.steps,original.steps);assert.deepEqual((await h.request('GET',undefined,id)).body.steps,original.steps);
  const record=h.records.get(id); record.roadmap_steps[0].dueDate='2020-01-01';record.roadmap_steps[0].done=true;record.roadmap_steps[0].completedAt='2020-01-02T00:00:00Z';
  const copy=structuredClone(record);const read=await h.request('GET',undefined,id);assert.equal(read.body.steps[0].dueDate,'2020-01-01');assert.deepEqual(h.records.get(id),copy);
 });
 test(`${route} list supports generated records`,async()=>{const h=harness(route);const created=await h.request('POST',{dream:'Test'});const listed=await h.request('GET');assert.equal(listed.status,200);assert.equal(listed.body.items[0].id,created.body.id);});
 test(`${route} isolates wishes by authenticated user`, async()=>{
  const h=harness(route);
  const created=await h.request('POST',{dream:'Private'}, undefined, 'user-a');
  assert.equal((await h.request('GET', undefined, undefined, 'user-b')).body.items.length, 0);
  assert.equal((await h.request('GET', undefined, created.body.id, 'user-b')).status, 404);
  assert.equal((await h.request('PATCH',{steps:[]},created.body.id,'user-b')).status, 404);
  assert.equal((await h.request('GET', undefined, undefined, 'invalid')).status, 401);
 });
 test(`${route} U09 AI crosses Japan midnight`,async()=>{
  const h=harness(route,{date:'2026-09-14T14:59:00Z',afterAI:'2026-09-14T15:01:00Z'});const r=await h.request('POST',{dream:'Test',deadline:'2026-09-14'});assert.equal(r.status,201);invariant(r.body,'2026-09-14','2026-09-14',7);assert.equal(r.body.createdAt,'2026-09-14T14:59:00.000Z');
 });
}
test('D14 total 0/1',()=>{assert.equal(dates.makeStepDueDatesFromToday(0,null,'2026-09-14').length,0);assert.equal(dates.makeStepDueDatesFromToday(1,'2026-09-21','2026-09-14')[0],'2026-09-14');});
test('U08 Japan date independent of TZ',()=>{
 const previous=process.env.TZ;
 try { for(const tz of ['UTC','Asia/Tokyo','America/Los_Angeles']) {process.env.TZ=tz;assert.equal(dates.todayInJapan(new Date('2026-09-13T15:30:00Z')),'2026-09-14');assert.equal(dates.todayInJapan(new Date('2026-09-13T14:59:00Z')),'2026-09-13');} }
 finally {if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
