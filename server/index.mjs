import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {calculate,regression,gradientDescent} from '../shared/math.mjs';
import {classification,clustering,pca,matrixCalculation,numericalRoot,definiteIntegral,statistics,compareRegression} from '../shared/advanced.mjs';
import {createResearch} from './research.mjs';
import {createAuth} from './auth.mjs';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const shared=fileURLToPath(new URL('../shared/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
export function createRequestHandler(options={}){
  const clients=new Map(),auth=createAuth(options),research=createResearch(options);
  return async(req,res)=>{
    const id=randomUUID(),start=performance.now();
    res.setHeader('X-Request-ID',id);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    res.on('finish',()=>{if(process.env.NODE_ENV!=='test')console.log(JSON.stringify({requestId:id,method:req.method,status:res.statusCode,durationMs:Math.round(performance.now()-start)}));});
    try{
      const path=typeof req.query?.route==='string'?'/api/'+req.query.route:new URL(req.url,'http://localhost').pathname;
      if(path==='/api/v1/health'||path==='/api/v1/ready'){if(req.method!=='GET')return json(405,{error:'Use GET.'});return json(200,{status:'ok',version:'0.2.0-alpha.1',mode:'deterministic'});}
      if(path.startsWith('/api/')){
        if(req.method==='GET'&&['/api/v1/auth/config','/api/v1/auth/session'].includes(path))return await auth(req,res,path);
        if(req.method!=='POST')return json(405,{error:'Use POST.'});
        const host=req.headers.host;const origin=req.headers.origin;
        if(origin&&new URL(origin).host!==host)return json(403,{error:'Cross-origin requests are not allowed.'});
        if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Send application/json.'});
        const authRequest=path.startsWith('/api/v1/auth/');const address=process.env.VERCEL==='1'?(req.headers['x-forwarded-for']??req.socket.remoteAddress):req.socket.remoteAddress;const key=String(address)+(authRequest?':auth':':math');const now=Date.now();for(const [k,v] of clients)if(now-v.start>60000)clients.delete(k);let client=clients.get(key);if(!client||now-client.start>60000){if(clients.size>=10000)return json(503,{error:'The service is busy. Try again shortly.'});client={start:now,count:0};clients.set(key,client);}if(++client.count>(authRequest?15:60)){res.setHeader('Retry-After','60');return json(429,{error:'Too many computations. Try again in one minute.'});}
        let data='',bytes=0;if(req.body!==undefined){data=typeof req.body==='string'?req.body:JSON.stringify(req.body);bytes=Buffer.byteLength(data);}else{for await(const chunk of req){bytes+=chunk.length;if(bytes>120000){json(413,{error:'Request must be under 120 KB.'});return;}data+=chunk;}}if(bytes>120000)return json(413,{error:'Request must be under 120 KB.'});
        let body;try{body=JSON.parse(data);}catch{return json(400,{error:'Invalid JSON.'});}
        if(!body||Array.isArray(body)||typeof body!=='object')return json(400,{error:'Send a JSON object.'});
        if(authRequest)return await auth(req,res,path,body);
        if(path==='/api/v1/research'){try{return json(200,await research(body));}catch(error){return json(422,{error:error.message});}}
        const handler={'/api/v1/classify':classification,'/api/v1/cluster':clustering,'/api/v1/pca':pca,'/api/v1/matrix':matrixCalculation,'/api/v1/root':numericalRoot,'/api/v1/integral':definiteIntegral,'/api/v1/statistics':statistics,'/api/v1/compare':compareRegression,'/api/v1/calculate':calculate,'/api/v1/train':regression,'/api/v1/gradient':gradientDescent}[path];
        if(!handler)return json(404,{error:'Unknown API endpoint.'});
        try{return json(200,handler(body));}catch(error){return json(422,{error:error.message,requestId:id});}
      }
      if(req.method!=='GET'&&req.method!=='HEAD')return json(405,{error:'Use GET.'});
      const sharedRequest=path.startsWith('/shared/');const base=sharedRequest?shared:root;const name=sharedRequest?path.slice(8):path==='/'?'index.html':path.slice(1);
      const file=resolve(base,name);if(!file.startsWith(base))return json(403,{error:'Forbidden.'});
      let buffer;try{buffer=await readFile(file);}catch{return json(404,{error:'File not found.'});}
      res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:buffer);
    }catch{if(!res.headersSent)json(400,{error:'Request could not be processed.',requestId:id});else res.end();}
  };
}
export function makeServer(options={}){const server=createServer(createRequestHandler(options));server.requestTimeout=10000;server.headersTimeout=10000;return server;}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT??4173),host=process.env.HOST??'127.0.0.1';const server=makeServer();server.on('error',error=>{console.error(`MathLens could not start: ${error.code}. Choose an available PORT (default 4173) and check local network permissions.`);process.exitCode=1;});server.listen(port,host,()=>console.log(`MathLens running at http://${host}:${port}`));}
