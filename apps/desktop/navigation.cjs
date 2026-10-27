const APP_ORIGIN='https://mathlens-wine.vercel.app';
function isAppURL(value){try{const url=new URL(value);return url.origin===APP_ORIGIN&&!url.username&&!url.password;}catch{return false;}}
function isExternalURL(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}catch{return false;}}
module.exports={APP_ORIGIN,isAppURL,isExternalURL};
