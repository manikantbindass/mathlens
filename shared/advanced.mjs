import {polynomial,evaluate,integral,regression} from './math.mjs';

export function seededShuffle(rows,seed=42){
  const result=rows.map(r=>[...r]);
  for(let i=result.length-1;i>0;i--){seed=(1664525*seed+1013904223)>>>0;const j=Math.floor(seed/4294967296*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
function numericRows(rows,min=10,max=1000){
  if(!Array.isArray(rows)||rows.length<min||rows.length>max||rows.some(r=>!Array.isArray(r)||r.length!==2||r.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e6)))throw new Error(`Provide ${min}–${max} rows of two finite numbers within ±1,000,000.`);
  return rows;
}
function bounded(value,min,max,label,integer=false){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value)))throw new Error(`${label} must be ${integer?'an integer ':''}between ${min} and ${max}.`);}
const average=a=>a.reduce((s,v)=>s+v,0)/a.length;
const sigmoid=z=>z>=0?1/(1+Math.exp(-z)):Math.exp(z)/(1+Math.exp(z));
export const classificationSample=()=>Array.from({length:100},(_,i)=>{const x=(i-50)/10;return [x,(i%13===0)?Number(x<0):Number(x>=0)];});
export function classification({rows=classificationSample(),testFraction=.2,threshold=.5,rate=.1,iterations=800,l2=.01}={}){
  numericRows(rows);if(rows.some(r=>![0,1].includes(r[1])))throw new Error('Classification labels must be 0 or 1.');
  if(![.2,.3,.4].includes(testFraction))throw new Error('Use test fraction 0.2, 0.3 or 0.4.');
  bounded(threshold,.05,.95,'Threshold');bounded(rate,.01,1,'Learning rate');bounded(iterations,50,1500,'Iterations',true);bounded(l2,0,1,'L2 penalty');
  const train=[],test=[];
  for(const label of [0,1]){const group=seededShuffle(rows.filter(r=>r[1]===label),42+label);if(group.length<3)throw new Error('Each class needs at least three observations for stratified splitting.');const count=Math.max(1,Math.min(group.length-2,Math.round(group.length*testFraction)));test.push(...group.slice(0,count));train.push(...group.slice(count));}
  const mean=average(train.map(r=>r[0])),scale=Math.sqrt(average(train.map(r=>(r[0]-mean)**2)));if(scale<1e-12)throw new Error('Training x values must vary.');
  let weight=0,intercept=0;const trace=[];
  const loss=()=>average(train.map(([x,y])=>{const z=weight*(x-mean)/scale+intercept;return Math.max(z,0)-z*y+Math.log1p(Math.exp(-Math.abs(z)));}))+l2*weight*weight/2;
  trace.push([0,loss()]);
  for(let i=1;i<=iterations;i++){let dw=l2*weight,db=0;for(const [x,y] of train){const z=(x-mean)/scale,e=sigmoid(weight*z+intercept)-y;dw+=e*z/train.length;db+=e/train.length;}weight-=rate*dw;intercept-=rate*db;if(i%Math.max(1,Math.floor(iterations/100))===0||i===iterations)trace.push([i,loss()]);}
  const predictions=test.map(([x,actual])=>{const probability=sigmoid(weight*(x-mean)/scale+intercept);return {x,actual,probability,predicted:Number(probability>=threshold)};});
  let tp=0,tn=0,fp=0,fn=0;for(const p of predictions){if(p.actual===1){if(p.predicted===1)tp++;else fn++;}else if(p.predicted===1)fp++;else tn++;}
  const precision=tp+fp?tp/(tp+fp):null,recall=tp/(tp+fn),f1=2*tp+fp+fn?2*tp/(2*tp+fp+fn):null;
  const positives=predictions.filter(p=>p.actual===1),negatives=predictions.filter(p=>p.actual===0);
  let concordance=0;for(const p of positives)for(const n of negatives)concordance+=p.probability>n.probability?1:p.probability===n.probability?.5:0;
  const rocAuc=concordance/(positives.length*negatives.length);
  const sorted=[...predictions].sort((a,b)=>b.probability-a.probability);const roc=[[0,0]];let rtp=0,rfp=0;
  for(let i=0;i<sorted.length;){const score=sorted[i].probability;while(i<sorted.length&&sorted[i].probability===score){if(sorted[i].actual===1)rtp++;else rfp++;i++;}roc.push([rfp/negatives.length,rtp/positives.length]);}
  const min=Math.min(...rows.map(r=>r[0])),max=Math.max(...rows.map(r=>r[0]));
  return {model:'Logistic regression',solver:'Batch gradient descent · L2 penalty on slope only',seed:42,rows,threshold,rate,iterations,l2,mean,scale,weight,intercept,trainingRows:train.length,testRows:test.length,trace,roc,predictions,metrics:{accuracy:(tp+tn)/test.length,precision,recall,f1,rocAuc,brier:average(predictions.map(p=>(p.probability-p.actual)**2)),logLoss:average(predictions.map(p=>-p.actual*Math.log(Math.max(1e-15,p.probability))-(1-p.actual)*Math.log(Math.max(1e-15,1-p.probability)))),majorityBaseline:Math.max(positives.length,negatives.length)/test.length},confusion:{tp,tn,fp,fn},curve:Array.from({length:121},(_,i)=>{const x=min+(max-min)*i/120;return [x,sigmoid(weight*(x-mean)/scale+intercept)];}),explanation:'Probability is σ(wz + b), z = (x − training mean) / training scale. A one-unit increase in z changes log-odds by w; exp(w) is the odds ratio. This is association, not causation. Metrics use a stratified held-out set. Probabilities are not guaranteed to be calibrated; one split is not a robust performance guarantee.'};
}
export const clusterSample=()=>Array.from({length:90},(_,i)=>{const group=i%3,theta=i*2.39996,r=.15+(i%11)/20;const center=[[-3,-1],[0,3],[3,-1]][group];return [center[0]+Math.cos(theta)*r,center[1]+Math.sin(theta)*r];});
const distance2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
export function clustering({rows=clusterSample(),k=3,maxIterations=100,standardize=true}={}){
  numericRows(rows,6,300);bounded(k,2,6,'Clusters',true);bounded(maxIterations,1,200,'Maximum iterations',true);if(typeof standardize!=='boolean')throw new Error('Standardize must be true or false.');
  if(new Set(rows.map(r=>JSON.stringify(r))).size<k)throw new Error('Provide at least k distinct points.');
  const mean=[0,1].map(j=>average(rows.map(r=>r[j]))),scale=[0,1].map(j=>Math.sqrt(average(rows.map(r=>(r[j]-mean[j])**2)))||1);
  const points=rows.map(r=>r.map((v,j)=>standardize?(v-mean[j])/scale[j]:v));let best;
  for(let restart=0;restart<5;restart++){
    const centers=[[...points[(42+restart*19)%points.length]]];
    while(centers.length<k){let far=-1,index=0;points.forEach((p,i)=>{const d=Math.min(...centers.map(c=>distance2(p,c)));if(d>far){far=d;index=i;}});centers.push([...points[index]]);}
    let assignments=[],iterations=0,converged=false;
    for(let iteration=0;iteration<maxIterations;iteration++){
      const next=points.map(p=>{let id=0;for(let c=1;c<k;c++)if(distance2(p,centers[c])<distance2(p,centers[id]))id=c;return id;});
      iterations=iteration+1;
      if(assignments.length&&next.every((v,i)=>v===assignments[i])){converged=true;break;}
      assignments=next;
      for(let c=0;c<k;c++){const members=points.filter((_,i)=>assignments[i]===c);if(!members.length)continue;centers[c]=[0,1].map(j=>average(members.map(p=>p[j])));}
    }
    // Reassign after the last centroid update; otherwise inertia and memberships can disagree.
    assignments=points.map(p=>{let id=0;for(let c=1;c<k;c++)if(distance2(p,centers[c])<distance2(p,centers[id]))id=c;return id;});
    const counts=Array.from({length:k},(_,c)=>assignments.filter(v=>v===c).length);
    if(counts.some(n=>!n))continue;
    const inertia=points.reduce((sum,p,i)=>sum+distance2(p,centers[assignments[i]]),0);
    if(!best||inertia<best.inertia)best={centers:centers.map(c=>[...c]),assignments,counts,inertia,iterations,converged};
  }
  if(!best)throw new Error('This dataset produced empty clusters. Reduce k or provide more distinct points.');
  const silhouette=average(points.map((p,i)=>{const own=best.assignments[i];if(best.counts[own]===1)return 0;const sums=Array(k).fill(0);points.forEach((other,j)=>{if(i!==j)sums[best.assignments[j]]+=Math.sqrt(distance2(p,other));});const a=sums[own]/(best.counts[own]-1),b=Math.min(...sums.filter((_,c)=>c!==own).map((s,index)=>{const cluster=Array.from({length:k},(_,c)=>c).filter(c=>c!==own)[index];return s/best.counts[cluster];}));return Math.max(a,b)?(b-a)/Math.max(a,b):0;}));
  return {model:'K-means',seed:42,restarts:5,k,standardize,mean,scale,rows,assignments:best.assignments,counts:best.counts,inertia:best.inertia,silhouette,iterations:best.iterations,converged:best.converged,centroids:best.centers.map(c=>c.map((v,j)=>standardize?v*scale[j]+mean[j]:v)),explanation:'Lloyd’s algorithm alternates nearest-centroid assignment and centroid means, using five deterministic farthest-point initializations. Inertia is squared distance in the fitting coordinates; it falls as k increases and cannot alone choose k. Silhouette measures separation in those same coordinates and assumes distance is meaningful. Clusters are exploratory groups, not verified classes or generalization metrics.'};
}
export function pca({rows=clusterSample(),standardize=false}={}){
  numericRows(rows,3,1000);if(typeof standardize!=='boolean')throw new Error('Standardize must be true or false.');
  const mean=[0,1].map(j=>average(rows.map(r=>r[j]))),scales=[0,1].map(j=>Math.sqrt(rows.reduce((s,r)=>s+(r[j]-mean[j])**2,0)/(rows.length-1))||1);
  const centered=rows.map(r=>r.map((v,j)=>(v-mean[j])/(standardize?scales[j]:1)));
  const a=centered.reduce((s,r)=>s+r[0]**2,0)/(rows.length-1),b=centered.reduce((s,r)=>s+r[0]*r[1],0)/(rows.length-1),d=centered.reduce((s,r)=>s+r[1]**2,0)/(rows.length-1);
  if(a+d<1e-20)throw new Error('PCA needs at least one varying feature.');
  const discriminant=Math.hypot(a-d,2*b);const eigenvalues=[(a+d+discriminant)/2,Math.max(0,(a+d-discriminant)/2)];
  const angle=.5*Math.atan2(2*b,a-d),components=[[Math.cos(angle),Math.sin(angle)],[-Math.sin(angle),Math.cos(angle)]];
  const scores=centered.map(r=>components.map(c=>r[0]*c[0]+r[1]*c[1]));
  const reconstruction=scores.map(r=>components[0].map((v,j)=>r[0]*v*(standardize?scales[j]:1)+mean[j]));
  const reconstructionMSE=average(rows.map((r,i)=>distance2(r,reconstruction[i])/2));
  return {model:'Principal component analysis · 2 features',rows,standardize,mean,scales,covariance:[[a,b],[b,d]],eigenvalues,components,scores,reconstruction,reconstructionMSE,explainedVarianceRatio:eigenvalues.map(v=>v/(a+d)),degenerate:discriminant<1e-12*(a+d),explanation:'PCA centers observations and diagonalizes the sample covariance matrix. PC1 maximizes projected variance, not predictive accuracy or causality. Standardization changes the distance geometry. Eigenvector signs are arbitrary; equal eigenvalues do not define a unique principal direction. Both components reconstruct the data; the displayed rank-one reconstruction discards PC2.'};
}
function matrix(value,label){if(!Array.isArray(value)||value.length<1||value.length>6||value.some(row=>!Array.isArray(row)||row.length!==value[0].length||row.length<1||row.length>6||row.some(v=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e6)))throw new Error(`${label}: use a rectangular JSON matrix, 1–6 rows/columns, finite numbers within ±1,000,000.`);return value.map(r=>[...r]);}
const transpose=a=>a[0].map((_,j)=>a.map(r=>r[j]));
function eliminate(a,b){
  const n=a.length,m=b[0].length,aug=a.map((r,i)=>[...r,...b[i]]);const norm=Math.max(...a.flat().map(Math.abs));let det=1,sign=1;
  for(let col=0;col<n;col++){let pivot=col;for(let i=col+1;i<n;i++)if(Math.abs(aug[i][col])>Math.abs(aug[pivot][col]))pivot=i;if(Math.abs(aug[pivot][col])<=Math.max(1,norm)*1e-12)throw new Error('Matrix is singular or numerically near-singular at this tolerance.');if(pivot!==col){[aug[pivot],aug[col]]=[aug[col],aug[pivot]];sign*=-1;}const value=aug[col][col];det*=value;for(let j=col;j<n+m;j++)aug[col][j]/=value;for(let i=0;i<n;i++)if(i!==col){const f=aug[i][col];for(let j=col;j<n+m;j++)aug[i][j]-=f*aug[col][j];}}
  return {result:aug.map(r=>r.slice(n)),determinant:det*sign};
}
export function matrixCalculation({a,b,operation='determinant'}={}){
  const A=matrix(a,'Matrix A');let result,steps,determinant,residual=null;
  if(operation==='transpose'){result=transpose(A);steps=['Swap row and column indices: (Aᵀ)ᵢⱼ = Aⱼᵢ.'];}
  else if(operation==='multiply'){const B=matrix(b,'Matrix B');if(A[0].length!==B.length)throw new Error('Columns of A must equal rows of B.');result=A.map(row=>B[0].map((_,j)=>row.reduce((sum,v,k)=>sum+v*B[k][j],0)));steps=['For each result cell, take the dot product of a row of A and a column of B.','Cᵢⱼ = Σₖ Aᵢₖ Bₖⱼ.'];}
  else if(['inverse','solve','determinant'].includes(operation)){
    if(A.length!==A[0].length)throw new Error('This operation requires a square matrix A.');
    const B=operation==='solve'?matrix(b,'Right-hand side B'):A.map((_,i)=>A.map((_,j)=>Number(i===j)));if(B.length!==A.length)throw new Error('The right-hand side needs one row per equation.');
    try{const solved=eliminate(A,B);determinant=solved.determinant;result=operation==='determinant'?determinant:solved.result;if(operation!=='determinant')residual=Math.max(...A.map((row,i)=>B[0].map((_,j)=>Math.abs(row.reduce((s,v,k)=>s+v*result[k][j],0)-B[i][j]))).flat());}catch(error){if(operation==='determinant'){result=0;determinant=0;steps=['Pivot falls below the relative numerical tolerance. Reported determinant is numerically zero; near-singularity is not an exact symbolic proof.'];}else throw error;}
    steps??=['Choose the largest available pivot in each column.','Swap rows, normalize the pivot, and eliminate other entries.','Arithmetic is floating point; inspect the residual and use caution for ill-conditioned matrices.'];
  }else throw new Error('Choose determinant, inverse, multiply, transpose or solve.');
  return {operation,a:A,result,determinant,residual,steps,notation:'Numerical linear algebra · partial pivoting · maximum 6×6'};
}
export function numericalRoot({expression='x^3-x-2',left=1,right=2,tolerance=1e-8,maxIterations=100}={}){
  bounded(left,-100,100,'Left endpoint');bounded(right,-100,100,'Right endpoint');bounded(tolerance,1e-12,.01,'Tolerance');bounded(maxIterations,1,200,'Maximum iterations',true);if(left>=right)throw new Error('Left endpoint must be less than right endpoint.');
  const coefficients=polynomial(expression);let lo=left,hi=right,flo=evaluate(coefficients,lo),fhi=evaluate(coefficients,hi);if(flo===0)return {root:lo,residual:0,converged:true,iterations:0,trace:[],bracket:[lo,hi],errorBound:0};if(fhi===0)return {root:hi,residual:0,converged:true,iterations:0,trace:[],bracket:[lo,hi],errorBound:0};if(Math.sign(flo)===Math.sign(fhi))throw new Error('Endpoints must bracket a sign change. Even-multiplicity roots may need another method.');
  const trace=[];let root=lo,residual=flo,converged=false;
  for(let i=0;i<maxIterations;i++){root=(lo+hi)/2;residual=evaluate(coefficients,root);trace.push({iteration:i+1,left:lo,right:hi,midpoint:root,value:residual,errorBound:(hi-lo)/2});if(residual===0||(hi-lo)/2<=tolerance){converged=true;break;}if(Math.sign(residual)===Math.sign(flo)){lo=root;flo=residual;}else{hi=root;fhi=residual;}}
  return {root,residual,converged,iterations:trace.length,trace,bracket:[left,right],errorBound:trace.at(-1).errorBound,plot:Array.from({length:161},(_,i)=>{const x=left+(right-left)*i/160;return [x,evaluate(coefficients,x)];}),method:'Bisection on a continuous polynomial. The interval bounds parameter error, not function residual. Numerical approximation, not a symbolic solution.'};
}
export function definiteIntegral({expression='x^2',left=0,right=1}={}){bounded(left,-100,100,'Lower bound');bounded(right,-100,100,'Upper bound');const coefficients=polynomial(expression),antiderivative=integral(coefficients);return {value:evaluate(antiderivative,right)-evaluate(antiderivative,left),left,right,expression,method:'Polynomial antiderivative evaluated at upper and lower bounds. Floating-point approximation; reversed bounds change the sign.'};}
export function statistics({rows}={}){
  numericRows(rows,2,1000);const columns=[0,1].map(j=>{const values=rows.map(r=>r[j]),mean=average(values),sorted=[...values].sort((a,b)=>a-b);const quantile=p=>{const i=p*(sorted.length-1),lo=Math.floor(i);return sorted[lo]+(sorted[Math.ceil(i)]-sorted[lo])*(i-lo);};const variance=values.reduce((s,v)=>s+(v-mean)**2,0)/(values.length-1);return {count:values.length,mean,median:quantile(.5),min:sorted[0],max:sorted.at(-1),q1:quantile(.25),q3:quantile(.75),sampleVariance:variance,sampleStd:Math.sqrt(variance)};});const centered=rows.reduce((s,r)=>s+(r[0]-columns[0].mean)*(r[1]-columns[1].mean),0),denominator=(rows.length-1)*columns[0].sampleStd*columns[1].sampleStd;return {columns,pearson:denominator?centered/denominator:null,method:'Sample variance uses n−1. Quartiles use linear interpolation at (n−1)p. Pearson correlation is undefined for a constant column and does not establish causation.'};
}
export function compareRegression({rows,testFraction=.2}={}){
  const models=[1,2,3].map(degree=>{const result=regression({...(rows?{rows}:{}),degree,testFraction});return {model:result.model,degree,metrics:result.metrics,trainingRows:result.trainingRows,testRows:result.testRows,seed:result.seed};});
  return {models,testFraction,seed:42,warning:'All models share the same held-out split. Comparing test scores to select a model reuses test information; use a separate validation set or cross-validation before reporting final performance.'};
}
