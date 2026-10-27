/** Householder QR least squares for bounded full-rank tall matrices.
 * Avoids forming AᵀA, which squares the condition number.
 */
export function leastSquares(design,target){
  const rows=design.length,columns=design[0].length;
  if(rows<columns)throw new Error('More training observations than model coefficients are required.');
  const a=design.map(r=>[...r]),b=[...target];
  const norm=Math.max(...a.map(r=>Math.hypot(...r)));
  for(let k=0;k<columns;k++){
    let magnitude=0;for(let i=k;i<rows;i++)magnitude=Math.hypot(magnitude,a[i][k]);
    if(magnitude<=Math.max(1,norm)*1e-12)throw new Error('Data cannot support this polynomial degree: the design is rank deficient.');
    const alpha=a[k][k]>=0?-magnitude:magnitude;
    const vector=Array.from({length:rows-k},(_,i)=>a[k+i][k]);vector[0]-=alpha;
    const length=Math.hypot(...vector);for(let i=0;i<vector.length;i++)vector[i]/=length;
    for(let col=k;col<columns;col++){let dot=0;for(let i=0;i<vector.length;i++)dot+=vector[i]*a[k+i][col];for(let i=0;i<vector.length;i++)a[k+i][col]-=2*vector[i]*dot;}
    let dot=0;for(let i=0;i<vector.length;i++)dot+=vector[i]*b[k+i];for(let i=0;i<vector.length;i++)b[k+i]-=2*vector[i]*dot;
  }
  const result=Array(columns).fill(0);
  for(let i=columns-1;i>=0;i--){let value=b[i];for(let j=i+1;j<columns;j++)value-=a[i][j]*result[j];result[i]=value/a[i][i];}
  return result;
}
