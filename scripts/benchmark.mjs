import {performance} from 'node:perf_hooks';
import {calculate,regression,gradientDescent} from '../shared/math.mjs';
const fixtures=[['polynomial-161-samples',()=>calculate({expression:'3*x^8-2*x^4+7*x-3',operation:'differentiate'}),1000],['regression-1000-rows-degree3',()=>regression({rows:Array.from({length:1000},(_,i)=>[i/100,Math.sin(i)+i/10]),degree:3}),100],['gradient-60-steps',()=>gradientDescent({iterations:60,rate:.1}),1000]];
console.log(JSON.stringify({node:process.version,platform:process.platform,arch:process.arch}));
for(const [name,fn,runs] of fixtures){for(let i=0;i<10;i++)fn();const durations=[];for(let i=0;i<runs;i++){const start=performance.now();fn();durations.push(performance.now()-start);}durations.sort((a,b)=>a-b);console.log(JSON.stringify({name,runs,medianMs:Number(durations[Math.floor(runs/2)].toFixed(4)),p95Ms:Number(durations[Math.floor(runs*.95)].toFixed(4))}));}
