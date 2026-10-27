const {app,BrowserWindow,shell,Menu,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs');
const {APP_ORIGIN,isAppURL,isExternalURL}=require('./navigation.cjs');
const smoke=process.env.MATHLENS_SMOKE_TEST==='1';
if(!app.requestSingleInstanceLock())app.quit();
let window;
async function openWindow(){
  window=new BrowserWindow({width:1380,height:940,minWidth:390,minHeight:600,show:!smoke,backgroundColor:'#050505',title:'MathLens',icon:path.join(__dirname,'assets/icon.png'),webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false}});
  const session=window.webContents.session;
  session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
  session.setPermissionCheckHandler(()=>false);
  session.on('will-download',(_event,item)=>{if(!isAppURL(item.getURL())&&!item.getURL().startsWith('blob:'+APP_ORIGIN+'/'))item.cancel();});
  window.webContents.setWindowOpenHandler(({url})=>{if(isExternalURL(url))shell.openExternal(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{if(!isAppURL(url)){event.preventDefault();if(isExternalURL(url))shell.openExternal(url);}});
  window.webContents.on('will-attach-webview',event=>event.preventDefault());
  window.webContents.on('did-fail-load',(_event,code,_description,_url,isMainFrame)=>{if(isMainFrame&&code!==-3&&!smoke)window.loadFile(path.join(__dirname,'offline.html'));});
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'MathLens',submenu:[{label:'Reload online workspace',click:()=>window.loadURL(APP_ORIGIN)},{label:'Open in browser',click:()=>shell.openExternal(APP_ORIGIN)},{type:'separator'},{role:'quit'}]},{label:'Edit',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}]));
  window.webContents.on('did-finish-load',async()=>{
    if(!smoke)return;
    try{
      const proof=await window.webContents.executeJavaScript(`Promise.all([fetch('/api/v1/health').then(r=>r.json()),fetch('/api/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({expression:'x^2-4*x+3',operation:'solve'})}).then(r=>r.json())]).then(([health,calculation])=>({title:document.title,heading:document.querySelector('main h1')?.textContent,health,calculation:calculation.result,nodeExposed:typeof window.require!=='undefined'}))`);
      if(!proof.title.includes('MathLens')||proof.health.status!=='ok'||proof.calculation!=='x = 1, 3'||proof.nodeExposed)throw new Error('Client smoke check failed');
      if(process.env.MATHLENS_SMOKE_REPORT)fs.writeFileSync(process.env.MATHLENS_SMOKE_REPORT,JSON.stringify({passed:true,platform:process.platform,...proof},null,2));
      app.exit(0);
    }catch(error){console.error(error.message);app.exit(1);}
  });
  if(smoke)setTimeout(()=>app.exit(1),60000).unref();
  await window.loadURL(APP_ORIGIN);
}
app.whenReady().then(openWindow).catch(error=>{console.error(error.message);if(!smoke)dialog.showErrorBox('MathLens could not start','Please open https://mathlens-wine.vercel.app in your browser.');app.exit(1);});
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
app.on('window-all-closed',()=>app.quit());
