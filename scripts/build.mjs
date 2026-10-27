import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const check=spawnSync(process.execPath,['scripts/check.mjs'],{stdio:'inherit'});if(check.status!==0)process.exit(1);
await mkdir('dist',{recursive:true});for(const folder of ['public','shared','server'])await cp(folder,'dist/'+folder,{recursive:true});
const pkg=JSON.parse(await readFile('package.json','utf8'));await writeFile('dist/package.json',JSON.stringify({...pkg,scripts:{start:'node server/index.mjs'}},null,2));
const index=await readFile('dist/public/index.html');await writeFile('dist/BUILD.json',JSON.stringify({version:pkg.version,node:process.version,entry:'server/index.mjs',indexSHA256:createHash('sha256').update(index).digest('hex')},null,2));
console.log('Runtime bundle built in dist/. Start with: node dist/server/index.mjs. This is a web alpha, not a native release.');
