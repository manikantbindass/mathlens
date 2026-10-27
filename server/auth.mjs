import {randomBytes,createHash} from 'node:crypto';

const cookieNames={access:'mathlens_access',refresh:'mathlens_refresh',verifier:'mathlens_verifier',flow:'mathlens_flow'};
const readCookies=req=>Object.fromEntries((req.headers.cookie??'').split(';').map(s=>s.trim().split(/=(.*)/s)).filter(parts=>parts[0]).map(([key,value])=>[key,value??'']));
function configuration(env){
  const url=env.SUPABASE_URL,key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key||key.startsWith('sb_secret_'))return null;
  // Legacy keys are JWTs. Refuse privileged service-role keys even if misconfigured by the owner.
  if(key.split('.').length===3){try{if(JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString()).role!=='anon')return null;}catch{return null;}}
  try{const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password)return null;return {url:parsed.origin,key};}catch{return null;}
}
const publicUser=user=>user?.id?{id:user.id,email:user.email??'',emailConfirmed:Boolean(user.email_confirmed_at)}:null;
/** Server-only GoTrue adapter. Tokens stay in HttpOnly cookies; no service-role key is used. */
export function createAuth({env=process.env,fetcher=fetch}={}){
  return async function auth(req,res,path,body={}){
    const config=configuration(env);
    const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
    const secure=env.VERCEL==='1'||env.NODE_ENV==='production';
    const setCookie=(name,value,maxAge)=>`${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure?'; Secure':''}`;
    const cookies=readCookies(req);
    const clearSession=()=>res.setHeader('Set-Cookie',[setCookie(cookieNames.access,'',0),setCookie(cookieNames.refresh,'',0)]);
    if(path==='/api/v1/auth/config')return send(200,{configured:Boolean(config),provider:'supabase'});
    if(path==='/api/v1/auth/logout'){
      clearSession();
      if(config&&cookies[cookieNames.access])try{await fetcher(`${config.url}/auth/v1/logout`,{method:'POST',headers:{apikey:config.key,Authorization:`Bearer ${cookies[cookieNames.access]}`},signal:AbortSignal.timeout(5000)});}catch{/* Clear this browser even when provider revocation is unavailable. */}
      return send(200,{message:'Signed out of this browser.'});
    }
    if(!config)return send(503,{error:'Authentication is not configured. The project owner must add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Vercel, then redeploy.',code:'AUTH_NOT_CONFIGURED'});
    const request=async(endpoint,payload,token)=>{
      const response=await fetcher(config.url+'/auth/v1'+endpoint,{method:payload===undefined?'GET':'POST',headers:{apikey:config.key,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(payload!==undefined?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(8000)});
      let data;try{data=await response.json();}catch{data={};}return {ok:response.ok,status:response.status,data};
    };
    const session=(data,extra=[])=>{
      if(typeof data.access_token!=='string'||typeof data.refresh_token!=='string'||!publicUser(data.user))return false;
      const ttl=Math.min(3600,Math.max(60,Number(data.expires_in)||3600));
      res.setHeader('Set-Cookie',[setCookie(cookieNames.access,data.access_token,ttl),setCookie(cookieNames.refresh,data.refresh_token,60*60*24*30),...extra]);return true;
    };
    const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    try{
      if(path==='/api/v1/auth/session'){
        const token=cookies[cookieNames.access];if(!token)return send(401,{error:'Sign in to view your account.',code:'NO_SESSION',canRefresh:Boolean(cookies[cookieNames.refresh])});
        const result=await request('/user',undefined,token);
        if(!result.ok)return send(result.status===401||result.status===403?401:503,{error:result.status===401||result.status===403?'Your session has expired. Please sign in again.':'Authentication provider is temporarily unavailable.',canRefresh:(result.status===401||result.status===403)&&Boolean(cookies[cookieNames.refresh])});
        return send(200,{user:publicUser(result.data)});
      }
      if(path==='/api/v1/auth/refresh'){
        if(!cookies[cookieNames.refresh])return send(401,{error:'Please sign in again.'});
        const result=await request('/token?grant_type=refresh_token',{refresh_token:cookies[cookieNames.refresh]});
        if(result.status>=500)return send(503,{error:'Authentication is temporarily unavailable. Please try again shortly.'});
        if(!result.ok||!session(result.data)){clearSession();return send(401,{error:'Your session has expired. Please sign in again.'});}
        return send(200,{user:publicUser(result.data.user)});
      }
      if(path==='/api/v1/auth/exchange'){
        const code=body.code,verifier=cookies[cookieNames.verifier],flow=cookies[cookieNames.flow];
        if(typeof code!=='string'||code.length>200||!code||!verifier)return send(400,{error:'This verification link has expired or was opened in a different browser. Request a new email in this browser.'});
        const result=await request('/token?grant_type=pkce',{auth_code:code,code_verifier:verifier});
        if(!result.ok||!session(result.data,[setCookie(cookieNames.verifier,'',0),setCookie(cookieNames.flow,'',0)]))return send(401,{error:'This verification link could not be confirmed. Request a new email in the same browser.'});
        return send(200,{user:publicUser(result.data.user),redirect:flow==='recovery'?'#/reset-password':'#/account'});
      }
      if(path==='/api/v1/auth/password'){
        if(typeof body.password!=='string'||body.password.length<12||body.password.length>128)return send(422,{error:'Use a password between 12 and 128 characters.'});
        if(!cookies[cookieNames.access])return send(401,{error:'Open your password recovery link first.'});
        const response=await fetcher(config.url+'/auth/v1/user',{method:'PUT',headers:{apikey:config.key,Authorization:`Bearer ${cookies[cookieNames.access]}`,'Content-Type':'application/json'},body:JSON.stringify({password:body.password}),signal:AbortSignal.timeout(8000)});
        if(!response.ok)return send(422,{error:'Password could not be updated. Request a fresh recovery link, and check the password requirements.'});
        clearSession();return send(200,{message:'Password updated. Sign in with your new password.'});
      }
      if(!['/api/v1/auth/login','/api/v1/auth/signup','/api/v1/auth/recover'].includes(path))return send(404,{error:'Unknown authentication endpoint.'});
      if(!validEmail(body.email))return send(422,{error:'Enter a valid email address.'});
      const email=body.email.trim();
      if(path==='/api/v1/auth/login'){
        if(typeof body.password!=='string'||body.password.length<1||body.password.length>128)return send(422,{error:'Enter your password (maximum 128 characters).'});
        const result=await request('/token?grant_type=password',{email,password:body.password});
        if(!result.ok||!session(result.data))return send(result.status===429?429:401,{error:result.status===429?'Too many sign-in attempts. Please wait before trying again.':'Unable to sign in. Check your email, password, and email confirmation.'});
        return send(200,{user:publicUser(result.data.user)});
      }
      if(path.endsWith('/signup')&&(typeof body.password!=='string'||body.password.length<12||body.password.length>128))return send(422,{error:'Use a password between 12 and 128 characters.'});
      const verifier=randomBytes(48).toString('base64url'),challenge=createHash('sha256').update(verifier).digest('base64url');
      // Validated browser Origin determines the exact deployment callback. No user-supplied redirect is accepted.
      const origin=req.headers.origin;if(!origin)return send(403,{error:'Open the authentication page in your browser.'});
      const callback=new URL('/?auth_callback=1',origin).href;
      const recovery=path.endsWith('/recover');
      const payload={email,code_challenge:challenge,code_challenge_method:'s256',...(!recovery?{password:body.password}:{})};
      const result=await request(`${recovery?'/recover':'/signup'}?redirect_to=${encodeURIComponent(callback)}`,payload);
      if(!result.ok)return send(result.status===429?429:422,{error:result.status===429?'Too many email requests. Please wait before trying again.':'The request could not be completed. Check your details or try again later.'});
      const verifierCookies=[setCookie(cookieNames.verifier,verifier,3600),setCookie(cookieNames.flow,recovery?'recovery':'signup',3600)];
      if(!recovery&&result.data.access_token&&session(result.data,verifierCookies))return send(200,{user:publicUser(result.data.user)});
      res.setHeader('Set-Cookie',verifierCookies);
      return send(200,{message:recovery?'If this address has an account, a recovery email will arrive. Open it in this browser within an hour.':'Check your email to confirm your account. Open the link in this browser within an hour. Existing accounts may need to sign in instead.'});
    }catch{return send(503,{error:'The authentication provider could not be reached. Please try again shortly.'});}
  };
}
