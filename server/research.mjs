const categories=['math','math.NT','math.AG','math.AP','math.PR','math.OC','stat.ML','cs.LG'];
/** Bounded, single-source Atom retrieval. No user-provided URL is accepted. */
export function createResearch({fetcher=fetch,now=Date.now}={}){
  const cache=new Map();let lastRequest=-Infinity,failures=0,retryAt=0;
  return async function research({category='math',page=0}={}){
    if(!categories.includes(category)||!Number.isInteger(page)||page<0||page>9)throw new Error('Choose a supported research category and a page from 0 to 9.');
    const key=category+':'+page,cached=cache.get(key),time=now();
    if(cached&&time-cached.checkedAt<600000)return {...cached,cached:true};
    if(time<retryAt||time-lastRequest<3100)return {...(cached??{}),available:false,stale:Boolean(cached),message:cached?'Showing an older cached feed. Retry after the provider cooldown.':'Feed provider is cooling down. Please wait a few seconds; curated references are still available.',retryAfter:Math.ceil(Math.max(retryAt-time,3100-(time-lastRequest))/1000)};
    lastRequest=time;
    const url=new URL('https://export.arxiv.org/api/query');url.searchParams.set('search_query',category==='math'?'cat:math.*':'cat:'+category);url.searchParams.set('start',String(page*10));url.searchParams.set('max_results','10');url.searchParams.set('sortBy','submittedDate');url.searchParams.set('sortOrder','descending');
    try{
      const response=await fetcher(url,{headers:{Accept:'application/atom+xml','User-Agent':'MathLens/0.1 educational research browser'},redirect:'error',signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('Provider unavailable');
      if(Number(response.headers.get('content-length')??0)>500000)throw new Error('Feed too large');
      let xml='',bytes=0;const reader=response.body?.getReader();if(!reader)throw new Error('Empty feed');
      const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>500000){await reader.cancel();throw new Error('Feed too large');}xml+=decoder.decode(value,{stream:true});}xml+=decoder.decode();
      if(/<!DOCTYPE|<!ENTITY/i.test(xml)||!/<feed(?:\s|>)/.test(xml))throw new Error('Invalid Atom feed');
      const entry={available:true,category,page,checkedAt:now(),xml,cached:false,source:'arXiv Atom API',status:'Preprint feed · not independently verified'};cache.set(key,entry);while(cache.size>12)cache.delete(cache.keys().next().value);failures=0;retryAt=0;return entry;
    }catch{failures++;retryAt=now()+Math.min(60000,5000*2**Math.min(failures-1,4));if(cached)return {...cached,available:false,cached:true,stale:true,message:'arXiv is unavailable. Showing the last cached feed; check its retrieval date.'};return {available:false,category,page,checkedAt:now(),message:'arXiv is unavailable or timed out. Browse curated references and try again later.',retryAfter:Math.ceil((retryAt-now())/1000)};}
  };
}
