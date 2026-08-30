const { app, BrowserWindow, clipboard } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const HOST = '127.0.0.1';
const PORT = 17862;
const PRODUCT = 'xinmacau-special-v7';
const PUBLIC_KEY_DER_B64 = 'MCowBQYDK2VwAyEAv7y7E5rZ3Hr6VGKJc4YbuTKrDCguHRAdvXq6T7/itio=';
const CLOCK_SKEW_MS = 5 * 60 * 1000;
let server;
let mainWindow;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else app.on('second-instance', () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

function b64urlDecode(text){
  const s=String(text||'').replace(/-/g,'+').replace(/_/g,'/');
  return Buffer.from(s + '='.repeat((4-s.length%4)%4),'base64');
}
function publicKey(){
  return crypto.createPublicKey({key:Buffer.from(PUBLIC_KEY_DER_B64,'base64'),format:'der',type:'spki'});
}
function getMachineGuid(){
  if(process.platform==='win32'){
    try{
      const out=execFileSync('reg',['query','HKLM\\SOFTWARE\\Microsoft\\Cryptography','/v','MachineGuid'],{encoding:'utf8',windowsHide:true});
      const m=out.match(/MachineGuid\s+REG_SZ\s+([^\r\n]+)/i);
      if(m&&m[1])return m[1].trim();
    }catch(e){}
  }
  return [os.hostname(),os.userInfo().username,process.platform,process.arch].join('|');
}
function machineCode(){
  return crypto.createHash('sha256').update('XinMacauSpecialV7|'+getMachineGuid()).digest('hex').slice(0,24).toUpperCase().match(/.{1,4}/g).join('-');
}
function licenseFile(){return path.join(app.getPath('userData'),'membership-license.json');}
function readState(){
  try{return JSON.parse(fs.readFileSync(licenseFile(),'utf8'));}catch(e){return {token:'',lastSeen:0};}
}
function writeState(state){
  const file=licenseFile();fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state,null,2),'utf8');fs.renameSync(tmp,file);
}
function verifyToken(token, now=Date.now()){
  try{
    const parts=String(token||'').trim().split('.');
    if(parts.length!==2)return {ok:false,error:'授权码格式错误'};
    const payloadBytes=b64urlDecode(parts[0]);
    const sig=b64urlDecode(parts[1]);
    if(!crypto.verify(null,payloadBytes,publicKey(),sig))return {ok:false,error:'授权签名无效'};
    const p=JSON.parse(payloadBytes.toString('utf8'));
    if(p.v!==1||p.product!==PRODUCT)return {ok:false,error:'授权码不适用于本软件'};
    if(String(p.machine||'')!==machineCode())return {ok:false,error:'授权码与本机不匹配'};
    if(!Number.isFinite(p.issuedAt)||!Number.isFinite(p.expiresAt)||p.expiresAt<=p.issuedAt)return {ok:false,error:'授权时间字段无效'};
    if(p.issuedAt>now+CLOCK_SKEW_MS)return {ok:false,error:'授权开始时间异常，请检查电脑时间'};
    if(now>p.expiresAt)return {ok:false,error:'会员授权已到期',payload:p};
    return {ok:true,payload:p};
  }catch(e){return {ok:false,error:'授权码无法解析'};}
}
function currentLicense(){
  const now=Date.now();
  const state=readState();
  if(state.lastSeen&&now+CLOCK_SKEW_MS<state.lastSeen)return {ok:false,error:'检测到系统时间回拨，请恢复正确时间后重试',clockRollback:true};
  const checked=verifyToken(state.token,now);
  if(checked.ok){
    state.lastSeen=Math.max(Number(state.lastSeen)||0,now);
    writeState(state);
  }
  return {...checked,state};
}
function activateToken(token){
  const now=Date.now();
  const next=verifyToken(token,now);
  if(!next.ok)return next;
  const old=readState();
  if(old.token){
    const oldChecked=verifyToken(old.token,now);
    let oldPayload=oldChecked.payload;
    if(!oldPayload){
      try{oldPayload=JSON.parse(b64urlDecode(String(old.token).split('.')[0]).toString('utf8'));}catch(e){}
    }
    if(oldPayload&&Number(oldPayload.expiresAt)>Number(next.payload.expiresAt))return {ok:false,error:'新授权到期时间早于当前授权，已拒绝覆盖'};
  }
  writeState({token:String(token).trim(),lastSeen:now,serial:next.payload.serial||''});
  return next;
}
function fmt(ms){
  if(!Number.isFinite(ms))return '—';
  return new Date(ms).toLocaleString('zh-CN',{hour12:false});
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function licenseHtml(message=''){
  const lic=currentLicense();
  const p=lic.payload||{};
  const valid=!!lic.ok;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>会员授权</title><style>*{box-sizing:border-box}body{margin:0;background:#071728;color:#edf5ff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(720px,100%);background:#0c2034;border:1px solid #294c6e;border-radius:20px;padding:28px}.head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}h1{margin:0 0 8px;font-size:27px}.status{padding:7px 11px;border-radius:999px;border:1px solid ${valid?'#2c7a58':'#8a454b'};background:${valid?'#123b2c':'#3b1c21'};color:${valid?'#9ff0c4':'#ffb0b3'};font-weight:800}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}.box{background:#081827;border:1px solid #24415e;border-radius:12px;padding:14px}.box small{display:block;color:#8fa7bf;margin-bottom:6px}.code{font:700 20px ui-monospace,Consolas,monospace;letter-spacing:1px;word-break:break-all;user-select:all;cursor:text}textarea{width:100%;min-height:128px;border:1px solid #345574;border-radius:12px;background:#061522;color:#fff;padding:13px;font:14px ui-monospace,Consolas,monospace;resize:vertical}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}button,a.btn{border:1px solid #4386ad;border-radius:11px;background:#176d98;color:#fff;padding:11px 16px;font-weight:800;text-decoration:none;cursor:pointer}.secondary{background:#112b43!important;border-color:#31516e!important}.msg{margin-top:14px;padding:11px 13px;border-radius:10px;background:#102a40;color:#c9def0}.warn{color:#ffbf83}.copyok{display:none;color:#9ff0c4;font-weight:800;align-self:center}.note{margin-top:18px;color:#91a7bd;font-size:13px;line-height:1.6}@media(max-width:620px){.grid{grid-template-columns:1fr}.head{display:block}.status{display:inline-block;margin-top:8px}}</style></head><body><main class="card"><div class="head"><div><h1>新澳门特码专栏 · 会员授权</h1><div style="color:#91a7bd">一机一码 · 到期续期</div></div><div class="status">${valid?'会员有效':'需要激活'}</div></div><div class="grid"><div class="box"><small>本机机器码</small><div class="code" id="machine" onclick="const r=document.createRange();r.selectNodeContents(this);const s=getSelection();s.removeAllRanges();s.addRange(r)">${esc(machineCode())}</div></div><div class="box"><small>当前会员</small><div>${esc(p.member||'未激活')}</div></div><div class="box"><small>授权到期</small><div>${esc(p.expiresAt?fmt(p.expiresAt):'—')}</div></div><div class="box"><small>状态</small><div class="${valid?'':'warn'}">${esc(valid?'正常':lic.error||'未激活')}</div></div></div><form method="post" action="/__license/activate"><textarea name="token" placeholder="把管理员发给你的会员授权码粘贴到这里"></textarea><div class="actions"><button type="submit">激活 / 续期</button><button type="button" class="secondary" id="copyMachine">复制机器码</button><span class="copyok" id="copyOk">已复制到Windows剪贴板</span>${valid?'<a class="btn secondary" href="/latest.html">返回软件</a>':''}</div></form>${message?`<div class="msg">${esc(message)}</div>`:''}<div class="note">授权码只适用于当前电脑。30天到期后，用新的续期码重新激活即可。若电脑系统时间明显回拨，软件会暂停授权校验，恢复正确时间后即可继续。</div><script>document.getElementById('copyMachine').addEventListener('click',async()=>{const b=document.getElementById('copyMachine'),ok=document.getElementById('copyOk');b.disabled=true;try{const r=await fetch('/__license/copy',{method:'POST',cache:'no-store'});if(!r.ok)throw new Error('copy failed');ok.style.display='inline';ok.textContent='已复制到Windows剪贴板';setTimeout(()=>ok.style.display='none',2200)}catch(e){ok.style.display='inline';ok.textContent='复制失败，请点击机器码后按 Ctrl+C'}finally{b.disabled=false}});</script></main></body></html>`;
}
function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'}[ext] || 'application/octet-stream';
}
function readBody(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>30000){reject(new Error('too large'));req.destroy();}});req.on('end',()=>resolve(b));req.on('error',reject);});}
function redirect(res,to){res.writeHead(303,{Location:to,'Cache-Control':'no-store'});res.end();}
function startLocalServer(){
  const root=path.resolve(__dirname,'app');
  return new Promise((resolve,reject)=>{
    server=http.createServer(async(req,res)=>{
      try{
        const u=new URL(req.url||'/',`http://${HOST}:${PORT}`);
        if(u.pathname==='/__license'){
          res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(licenseHtml(u.searchParams.get('m')||''));return;
        }
        if(u.pathname==='/__license/copy'&&req.method==='POST'){
          clipboard.writeText(machineCode(),'clipboard');
          res.writeHead(204,{'Cache-Control':'no-store'});res.end();return;
        }
        if(u.pathname==='/__license/activate'&&req.method==='POST'){
          const body=await readBody(req);const params=new URLSearchParams(body);const result=activateToken(params.get('token')||'');
          redirect(res,'/__license?m='+encodeURIComponent(result.ok?'激活成功':result.error||'激活失败'));return;
        }
        if(u.pathname==='/latest.html'&&!currentLicense().ok){redirect(res,'/__license');return;}
        const raw=decodeURIComponent(u.pathname);
        const rel=raw==='/'?'/index.html':raw;
        const file=path.resolve(root,'.'+rel);
        if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end('Forbidden');return;}
        fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':contentType(file),'Cache-Control':'no-store, max-age=0'});res.end(data);});
      }catch(e){res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('Internal error');}
    });
    server.on('error',reject);
    server.listen(PORT,HOST,()=>resolve(`http://${HOST}:${PORT}`));
  });
}
async function createWindow(){
  const base=await startLocalServer();
  const entry=currentLicense().ok?base+'/latest.html':base+'/__license';
  mainWindow=new BrowserWindow({width:1440,height:980,minWidth:1000,minHeight:720,backgroundColor:'#071728',autoHideMenuBar:true,webPreferences:{contextIsolation:true,sandbox:true,nodeIntegration:false}});
  mainWindow.setMenuBarVisibility(false);
  await mainWindow.loadURL(entry);
  mainWindow.on('closed',()=>{mainWindow=null;});
}
app.whenReady().then(createWindow).catch(error=>{console.error(error);app.quit();});
app.on('window-all-closed',()=>{if(server)server.close();if(process.platform!=='darwin')app.quit();});
