import {leastSquares} from './linear-algebra.mjs';
/** Bounded polynomial parser. No eval, Function, imports, property access or arbitrary code. */
export function polynomial(input) {
  if (typeof input !== 'string' || input.length > 200) throw new Error('Enter a polynomial of up to 200 characters.');
  const text = input.replace(/\s/g, '').replace(/−/g, '-');
  if (!text || !/^[0-9xX.+*^\-]+$/.test(text)) throw new Error('Use polynomial terms such as 3*x^2 - 2*x + 1. Functions, parentheses and division are not supported.');
  const terms = text.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== text) throw new Error('Invalid polynomial.');
  const coefficients = Array(9).fill(0);
  for (const term of terms) {
    const match = /^([+-]?)(?:(\d+(?:\.\d+)?|\.\d+)\*?)?([xX])?(?:\^(\d+))?$/.exec(term);
    if (!match || (!match[2] && !match[3]) || (!match[3] && (match[4] || term.includes('*')))) throw new Error('Invalid term: ' + term);
    const degree = match[3] ? Number(match[4] ?? 1) : 0;
    const value = Number(match[2] ?? 1) * (match[1] === '-' ? -1 : 1);
    if (degree > 8 || Math.abs(value) > 1e6) throw new Error('Maximum degree is 8; coefficients must be at most 1,000,000.');
    coefficients[degree] += value;
  }
  return trim(coefficients);
}
const trim = a => { while (a.length > 1 && a.at(-1) === 0) a.pop(); return a; };
export const evaluate = (a, x) => a.reduceRight((sum, value) => sum * x + value, 0);
export const derivative = a => a.length === 1 ? [0] : a.slice(1).map((v, i) => v * (i + 1));
export const integral = a => [0, ...a.map((v, i) => v / (i + 1))];
export function formatPolynomial(a) {
  const terms = [];
  for (let i = a.length - 1; i >= 0; i--) {
    if (!a[i]) continue;
    const n = Math.abs(a[i]);
    const value = Number(n.toPrecision(8));
    const term = `${i && n === 1 ? '' : value}${i ? 'x' : ''}${i > 1 ? '^' + i : ''}`;
    terms.push(`${terms.length ? (a[i] < 0 ? ' − ' : ' + ') : a[i] < 0 ? '−' : ''}${term}`);
  }
  return terms.join('') || '0';
}
export function roots(a) {
  if (a.length > 3) throw new Error('Real root solving supports linear and quadratic polynomials.');
  if (a.length === 1) return a[0] === 0 ? 'Every real number' : 'No roots';
  if (a.length === 2) return [-a[0] / a[1]];
  const [c,b,aa] = a; const d = b*b-4*aa*c;
  if (d < 0) return 'No real roots';
  if (d === 0) return [-b/(2*aa)];
  const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(d));
  return [q / aa, c / q].sort((x,y) => x-y);
}
export function calculate({expression, operation}) {
  const a = polynomial(expression);
  let result, steps;
  switch (operation) {
    case 'differentiate': result = formatPolynomial(derivative(a)); steps = ['Combine like powers of x.', 'Apply the power rule to each term: d(axⁿ)/dx = naxⁿ⁻¹.', 'The derivative of a constant is zero.']; break;
    case 'integrate': result = formatPolynomial(integral(a)) + ' + C'; steps = ['Apply the power rule: ∫axⁿ dx = axⁿ⁺¹/(n+1).', 'Add the arbitrary constant C.', 'Coefficients are computed with floating-point arithmetic.']; break;
    case 'solve': { const r = roots(a); result = Array.isArray(r) ? 'x = ' + r.map(n => Number(n.toPrecision(10))).join(', ') : r; steps = ['Set the polynomial equal to zero.', a.length === 3 ? 'Use the quadratic formula: x = (−b ± √(b² − 4ac)) / 2a.' : 'Isolate x using the linear coefficient.', 'Only real roots are shown; numerical values are approximations.']; break; }
    case 'simplify': result = formatPolynomial(a); steps = ['Collect coefficients of equal powers.', 'Remove zero coefficients and order by decreasing degree.']; break;
    default: throw new Error('Choose a supported operation.');
  }
  return {result,steps,coefficients:a,plot:Array.from({length:161},(_,i)=>{const x=-4+i/20;return [x,evaluate(a,x)];}),notation:'Deterministic calculation · floating-point coefficients'};
}
export function parseCSV(text) {
  if (typeof text !== 'string' || text.length > 100000) throw new Error('CSV must be under 100 KB.');
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 11 || lines.length > 1001) throw new Error('Provide 10–1,000 numeric rows with an x,y header.');
  if (lines.shift().trim().toLowerCase() !== 'x,y') throw new Error('Use exactly two columns with the header x,y.');
  return lines.map((line,i)=>{const cells=line.split(',');const row=cells.map(v=>Number(v.trim()));if(cells.length!==2||cells.some(v=>!v.trim())||row.some(v=>!Number.isFinite(v)||Math.abs(v)>1e6))throw new Error(`Row ${i+2}: provide two finite numbers within ±1,000,000.`);return row;});
}
export const sampleData = () => Array.from({length:60},(_,i)=>{const x=i/6;return [x,2.4*x+3+Math.sin(i*2.3)*1.8];});
export function regression({rows=sampleData(),degree=1,testFraction=0.2}={}) {
  if (!Array.isArray(rows)||rows.length<10||rows.length>1000||rows.some(r=>!Array.isArray(r)||r.length!==2||r.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e6))) throw new Error('Use 10–1,000 rows of finite numeric x,y values.');
  if (![1,2,3].includes(degree)||![0.2,0.3,0.4].includes(testFraction)) throw new Error('Choose degree 1–3 and a supported test split.');
  // Fixed-seed Fisher–Yates split gives repeatable comparisons without selecting on target.
  let seed=42; const shuffled=rows.map(r=>[...r]);
  for(let i=shuffled.length-1;i>0;i--){seed=(1664525*seed+1013904223)>>>0;const j=Math.floor(seed/4294967296*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const count=Math.max(2,Math.round(rows.length*testFraction));const test=shuffled.slice(0,count),train=shuffled.slice(count);
  const mean=train.reduce((s,r)=>s+r[0],0)/train.length;
  const scale=Math.sqrt(train.reduce((s,r)=>s+(r[0]-mean)**2,0)/train.length);
  if(scale<1e-12)throw new Error('Training x values must vary.');
  const size=degree+1;const design=train.map(([x])=>Array.from({length:size},(_,power)=>((x-mean)/scale)**power));
  const coefficients=leastSquares(design,train.map(r=>r[1]));const predict=x=>evaluate(coefficients,(x-mean)/scale);
  const predictions=test.map(([x,y])=>({x,actual:y,predicted:predict(x),residual:y-predict(x)}));
  const mse=predictions.reduce((s,r)=>s+r.residual**2,0)/count,mae=predictions.reduce((s,r)=>s+Math.abs(r.residual),0)/count;
  const ymean=test.reduce((s,r)=>s+r[1],0)/count;const total=test.reduce((s,r)=>s+(r[1]-ymean)**2,0);
  const min=Math.min(...rows.map(r=>r[0])),max=Math.max(...rows.map(r=>r[0]));
  return {solver:'Householder QR',model:degree===1?'Linear regression':`Polynomial regression (degree ${degree})`,coefficients,mean,scale,degree,seed:42,testFraction,trainingRows:train.length,testRows:count,metrics:{mae,mse,rmse:Math.sqrt(mse),r2:total>0?1-mse*count/total:null},predictions,rows,curve:Array.from({length:101},(_,i)=>{const x=min+(max-min)*i/100;return [x,predict(x)];}),equation:formatPolynomial(coefficients).replaceAll('x','z'),explanation:'Coefficients describe the fitted response in standardized training coordinates z = (x − mean) / scale. They describe association, not causation. Metrics use only the held-out test set. Small samples and a single split can mislead.'};
}
export function gradientDescent({rate=0.1,initial=4,iterations=20}={}) {
  if(!Number.isFinite(rate)||rate<0.01||rate>1.1||!Number.isFinite(initial)||Math.abs(initial)>5||!Number.isInteger(iterations)||iterations<1||iterations>60)throw new Error('Invalid gradient descent parameters.');
  let x=initial;const points=[[0,x,x*x]];for(let i=1;i<=iterations;i++){x-=rate*2*x;points.push([i,x,x*x]);}return {points,final:x,loss:x*x,converges:rate<1,objective:'L(θ) = θ²',update:'θₜ₊₁ = θₜ − η · 2θₜ'};
}
export function puzzle(index=0,difficulty='foundation',category='algebra') {
  if(!Number.isInteger(index)||index<0||index>1e6||!['foundation','intermediate','advanced'].includes(difficulty)||!['algebra','sequences','number-theory','arithmetic','geometry','probability','logic','calculus','riddles','olympiad'].includes(category))throw new Error('Invalid puzzle settings.');
  const offset={foundation:0,intermediate:8,advanced:23}[difficulty];const n=3+(index*7+offset)%37;const a=2+(index+offset)%9;const b=4+(index*3+offset)%19;
  if(category==='arithmetic')return {question:`Compute (${n} + ${b}) × ${a}.`,answer:(n+b)*a,hints:['Evaluate the parentheses first.',`${n} + ${b} = ${n+b}. Now multiply by ${a}.`],solution:`(${n} + ${b}) × ${a} = ${n+b} × ${a} = ${(n+b)*a}.`};
  if(category==='geometry')return {question:`A rectangle has width ${a} and perimeter ${2*(a+n)}. What is its area?`,answer:a*n,hints:['Perimeter = 2 × (width + length).',`Length = ${2*(a+n)} / 2 − ${a} = ${n}.`],solution:`The length is ${n}, so the area is ${a} × ${n} = ${a*n} square units.`};
  if(category==='probability')return {question:`A bag contains ${a} white balls and ${n} black balls. What is the probability that one uniformly random draw is white?`,answer:a/(a+n),hints:['Probability = favorable outcomes / total outcomes.',`There are ${a+n} balls in total.`],solution:`P(white) = ${a} / (${a} + ${n}) = ${a}/${a+n}. Any equivalent fraction or accurate decimal is accepted.`};
  if(category==='logic')return {question:`A drawer has ${a} colors of socks, with at least two socks of every color. Without looking, how many socks guarantee at least one matching-color pair?`,answer:a+1,hints:['Consider the worst case: every sock so far has a different color.',`After ${a} different colors, one more sock must repeat a color.`],solution:`By the pigeonhole principle, ${a} + 1 = ${a+1} socks guarantee a repeated color.`};
  if(category==='calculus')return {question:`For f(x) = ${a}x² + ${b}x, what is f′(${n})?`,answer:2*a*n+b,hints:['Differentiate using the power rule.',`f′(x) = ${2*a}x + ${b}. Substitute x = ${n}.`],solution:`f′(${n}) = ${2*a} × ${n} + ${b} = ${2*a*n+b}.`};
  if(category==='riddles')return {question:`I think of a number, multiply it by ${a}, and add ${b}. The result is ${a*n+b}. What was my number?`,answer:n,hints:['Undo the addition before undoing the multiplication.',`Subtract ${b}, then divide by ${a}.`],solution:`(${a*n+b} − ${b}) / ${a} = ${n}.`};
  if(category==='olympiad')return {question:`What is the sum of all integers from 1 through ${n}, inclusive?`,answer:n*(n+1)/2,hints:['Pair the first number with the last, the second with the next-to-last, and so on.',`Twice the sum is ${n} × ${n+1}.`],solution:`1 + 2 + … + ${n} = ${n}(${n}+1)/2 = ${n*(n+1)/2}.`};
  if(category==='sequences')return {question:`${n}, ${n+a}, ${n+2*a}, ${n+3*a}, … What comes next?`,answer:n+4*a,hints:['Find the difference between consecutive terms.',`Each term increases by ${a}.`],solution:`This arithmetic sequence has common difference ${a}. The next term is ${n+3*a} + ${a} = ${n+4*a}.`};
  if(category==='number-theory')return {question:`What is the remainder when ${n*a+b} is divided by ${a}?`,answer:(n*a+b)%a,hints:['A remainder must be smaller than the divisor.',`Find the largest multiple of ${a} that does not exceed ${n*a+b}.`],solution:`${n*a+b} = ${Math.floor((n*a+b)/a)} × ${a} + ${(n*a+b)%a}. The remainder is ${(n*a+b)%a}.`};
  return {question:`Solve for x: ${a}x + ${b} = ${a*n+b}`,answer:n,hints:[`Subtract ${b} from both sides.`,`Now divide both sides by ${a}.`],solution:`Subtract ${b}: ${a}x = ${a*n}. Divide by ${a}: x = ${n}.`};
}
