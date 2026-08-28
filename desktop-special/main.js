const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 17862;
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

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    '.html':'text/html; charset=utf-8',
    '.js':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8',
    '.json':'application/json; charset=utf-8',
    '.png':'image/png',
    '.jpg':'image/jpeg',
    '.jpeg':'image/jpeg',
    '.svg':'image/svg+xml'
  }[ext] || 'application/octet-stream';
}

function startLocalServer(){
  const root=path.resolve(__dirname,'app');
  return new Promise((resolve,reject)=>{
    server=http.createServer((req,res)=>{
      const raw=decodeURIComponent((req.url||'/').split('?')[0]);
      const rel=raw==='/'?'/index.html':raw;
      const file=path.resolve(root,'.'+rel);
      if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end('Forbidden');return;}
      fs.readFile(file,(err,data)=>{
        if(err){res.writeHead(404);res.end('Not found');return;}
        res.writeHead(200,{'Content-Type':contentType(file),'Cache-Control':'no-store, max-age=0'});
        res.end(data);
      });
    });
    server.on('error',reject);
    server.listen(PORT,HOST,()=>resolve(`http://${HOST}:${PORT}/latest.html`));
  });
}

async function createWindow(){
  const url=await startLocalServer();
  mainWindow=new BrowserWindow({
    width:1440,
    height:980,
    minWidth:1000,
    minHeight:720,
    backgroundColor:'#071728',
    autoHideMenuBar:true,
    webPreferences:{contextIsolation:true,sandbox:true,nodeIntegration:false}
  });
  mainWindow.setMenuBarVisibility(false);
  await mainWindow.loadURL(url);
  mainWindow.on('closed',()=>{mainWindow=null;});
}

app.whenReady().then(createWindow).catch(error=>{console.error(error);app.quit();});
app.on('window-all-closed',()=>{if(server)server.close();if(process.platform!=='darwin')app.quit();});
