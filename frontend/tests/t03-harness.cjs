/* eslint-disable @typescript-eslint/no-require-imports -- CJS harness for isolated TypeScript API execution. */
// Run: node tests/t03.cjs. No real AI or DB calls; actual API sources run in a VM.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const backend = path.resolve(root, '../backend');
const backendRequire = createRequire(path.join(backend, 'package.json'));
function harness(route, { date = '2026-09-14T03:00:00Z', mode = 'ai', count = 7, raw, afterAI, memory = false } = {}) {
  let clock = date;
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [clock])); } static now() { return new Date(clock).getTime(); } }
  const records = new Map();
  const env = { GEMINI_API_KEY: mode === 'missing' ? '' : 'test', SUPABASE_URL: memory ? '' : 'https://test.invalid', SUPABASE_SERVICE_ROLE_KEY: memory ? '' : 'test' };
  const responseText = () => {
    if (afterAI) clock = afterAI;
    if (mode === 'network' || mode === 'http') throw new Error('controlled AI failure');
    if (mode === 'json') return '{';
    return JSON.stringify(raw !== undefined ? raw : { steps: Array.from({length: count}, (_, i) => ({title: `Step ${i}`, detail: 'Action', dueDate: ['2020-01-01','2026-02-30','','2099-01-01','2026-09-20','2026-09-15'][i % 6]})) });
  };
  const db = { auth: { getUser: async (token) => ['test-token', 'user-a', 'user-b'].includes(token) ? { data: { user: { id: token === 'user-b' ? 'user-b' : 'user-a' } }, error: null } : { data: { user: null }, error: { message: 'unauthorized' } } }, from() {
    let operation = 'read', value, key, status, userId;
    const query = {
      insert(record) { operation = 'insert'; value = record; return query; },
      update(record) { operation = 'update'; value = record; return query; },
      select() { return query; }, order() { return query; },
      eq(column, v) { if (column === 'id') key = v; if(column === 'status') status = v; if(column === 'user_id') userId = v; return query; },
      async single() {
        if(operation === 'insert') { key = value.id; records.set(key, structuredClone(value)); }
        if(operation === 'update' && records.get(key)?.user_id === userId) records.set(key, {...records.get(key), ...structuredClone(value)});
        const record = records.get(key);
        return {data: record?.user_id === userId ? structuredClone(record) : undefined, error: record?.user_id === userId ? null : {message:'missing'}};
      },
      then(resolve, reject) { return Promise.resolve({ data: [...records.values()].filter(r => r.user_id === userId && (!status || r.status === status)), error: null }).then(resolve, reject); }
    }; return query;
  }};
  const cache = new Map();
  function load(file) {
    if(cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} }; cache.set(file,mod);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022} }).outputText;
    const customRequire = (name) => {
      if(name === '@supabase/supabase-js') return {createClient:()=>db};
      if(name === '../lib/supabase') return {supabase:db, getAuthUser: async (header) => {
        const token = header?.slice('Bearer '.length);
        if(!['test-token', 'user-a', 'user-b'].includes(token)) throw new Error('Unauthorized');
        return {id: token === 'user-b' ? 'user-b' : 'user-a'};
      }};
      if(name === '@google/generative-ai') return {SchemaType:{OBJECT:'object',ARRAY:'array',STRING:'string'}, GoogleGenerativeAI:class { getGenerativeModel(){return {generateContent: async()=>({response:{text:responseText}})};} }};
      if(name.startsWith('@/')) return load(path.join(root,'src',name.slice(2)+'.ts'));
      if(name.startsWith('.')) return load(path.resolve(path.dirname(file), name+'.ts'));
      return file.startsWith(backend) ? backendRequire(name) : require(name);
    };
    vm.runInNewContext(code, { exports:mod.exports, module:mod, require:customRequire, process:{env}, URL, Date:Clock, console:{error(){}}, setTimeout, fetch:async()=>{
      if(mode==='network') throw new Error('controlled network failure');
      if(mode==='http') return {ok:false};
      const text=responseText(); return {ok:true,json:async()=>({candidates:[{content:{parts:[{text}]}}]})};
    }}, {filename:file});
    return mod.exports;
  }
  const api = route==='H' ? load(path.join(backend,'src/routes/tanzaku.ts')).default : load(path.join(root,'src/app/api/tanzaku/route.ts'));
  const detail = route==='N' ? load(path.join(root,'src/app/api/tanzaku/[id]/route.ts')) : null;
  async function request(method, body, id, token = 'test-token') {
    const url='http://test/api/tanzaku'+(id?'/'+id:'');
    const options={method,headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})};
    let result;
    if(route==='H') result=await api.request('http://test/'+(id??''),options);
    else result=await (id?detail:api)[method](new Request(url,options),{params:Promise.resolve({id})});
    return {status:result.status,body:await result.json()};
  }
  return {request, records, load, setClock:v=>{clock=v;}};
}

module.exports = { harness };
