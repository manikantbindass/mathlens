import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function walk(path){const out=[];for(const entry of await readdir(path,{withFileTypes:true})){if(['node_modules','dist','.git','test-results'].includes(entry.name))continue;const full=path+'/'+entry.name;if(entry.isDirectory())out.push(...await walk(full));else if(full.endsWith('.mjs'))out.push(full);}return out;}
const files=await walk('.');for(const file of files){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);}console.log(`Syntax checked ${files.length} JavaScript modules.`);
