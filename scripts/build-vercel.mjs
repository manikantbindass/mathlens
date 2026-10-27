import {cp,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const checks=spawnSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});if(checks.status!==0)process.exit(1);
await mkdir('dist/public/shared',{recursive:true});
await cp('public','dist/public',{recursive:true});
await cp('shared','dist/public/shared',{recursive:true});
console.log('Vercel static assets prepared. API uses api/index.mjs with the shared Node request handler.');
