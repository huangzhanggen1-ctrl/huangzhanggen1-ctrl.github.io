const fs = require('fs');
const path = require('path');

const oldBuilder = path.join(__dirname, 'build-snapshot.js');
let source = fs.readFileSync(oldBuilder, 'utf8');

const oldSidePatch = `r('if(mode==="group")return DOMESTIC.indexOf(zodiac)!==-1?"家禽":"野兽";', 'if(mode==="custom")return customSide(zodiac);if(mode==="group")return DOMESTIC.indexOf(zodiac)!==-1?"家禽":"野兽";', 'custom side mapping');`;
const dynamicPatches = `r('function isHit(row,mode,value){return row[mode]===value}', 'function isHit(row,mode,value){return mode==="custom"?customSide(row.zodiac)===value:row[mode]===value}', 'dynamic custom hit');\nr('if(classes[mode]===value)count+=1', 'if((mode==="custom"?customSide(zodiac):classes[mode])===value)count+=1', 'dynamic custom baseline count');\nr('value=latest?latest[state.mode]:MODE[state.mode].values[0];', 'value=latest&&latest[state.mode]!=null?latest[state.mode]:MODE[state.mode].values[0];', 'custom default selection');\nr('safeText(row[state.mode])+(simulation?', 'safeText(state.mode==="custom"?customSide(row.zodiac):row[state.mode])+(simulation?', 'custom current status');`;
if (!source.includes(oldSidePatch)) throw new Error('Unable to replace obsolete side mapping patch');
source = source.replace(oldSidePatch, dynamicPatches);

const oldBaselinePatch = `r('if(mode==="group")return DOMESTIC.length/12;', 'if(mode==="custom"){var chosen=value==="A组"?customGroups.A:customGroups.B,countCustom=0,customDate=row&&row.date?row.date:"2026-02-17";for(var customNum=1;customNum<=49;customNum++){if(chosen.indexOf(zodiacFor(customNum,customDate))>=0)countCustom++}return countCustom/49}if(mode==="group")return DOMESTIC.length/12;', 'custom theoretical baseline');`;
if (!source.includes(oldBaselinePatch)) throw new Error('Unable to remove obsolete baseline patch');
source = source.replace(oldBaselinePatch, '');

const oldEditorPatch = `r('</section>\\n  <div class="smp-data-status" id="smp-source-status"', '</section>'+editor+'<div class="smp-data-status" id="smp-source-status"', 'custom group editor');`;
const newEditorPatch = `r('<div class="smp-data-status" id="smp-source-status"', editor+'<div class="smp-data-status" id="smp-source-status"', 'custom group editor');`;
if (!source.includes(oldEditorPatch)) throw new Error('Unable to replace editor insertion patch');
source = source.replace(oldEditorPatch, newEditorPatch);

const oldRenderPatch = `r('renderMaSettings()\\n  }', 'renderMaSettings();renderCustomGroups()\\n  }', 'render custom groups');`;
const newRenderPatch = `r('renderMaSettings()', 'renderMaSettings();renderCustomGroups()', 'render custom groups');`;
if (!source.includes(oldRenderPatch)) throw new Error('Unable to replace custom render anchor');
source = source.replace(oldRenderPatch, newRenderPatch);

const oldInitPatch = `r('function init(){\\n    bind();', 'function init(){\\n    loadCustomGroups();bind();', 'load custom groups');`;
const newInitPatch = `r('function init(){', 'function init(){loadCustomGroups();', 'load custom groups');`;
if (!source.includes(oldInitPatch)) throw new Error('Unable to replace custom init anchor');
source = source.replace(oldInitPatch, newInitPatch);

const temp = path.join(__dirname, '.build-snapshot-v2-runtime.js');
fs.writeFileSync(temp, source, 'utf8');
try {
  require(temp);
} finally {
  try { fs.unlinkSync(temp); } catch {}
}

// Add desktop-only real-bar long-window rendering + zoom. 500/700/all must never collapse to a line.
const appDir = path.join(__dirname, 'app');
const appHtml = path.join(appDir, 'index.html');
let html = fs.readFileSync(appHtml, 'utf8');
function hr(oldText,newText,label){
  if(!html.includes(oldText)) throw new Error('Desktop long-window patch target not found: '+label);
  html=html.replace(oldText,newText);
}
hr('windowSize:100,periodDays:1,overlay:', 'windowSize:100,periodDays:1,chartZoom:8,overlay:', 'chart zoom state');
hr('var actualSeries=series.filter(function(row){return !row.simulated}),longWindow=actualSeries.length>300;', 'var actualSeries=series.filter(function(row){return !row.simulated}),longWindow=false;', 'disable line fallback');
hr('var stageWidth=longWindow?Math.max(scroll.clientWidth,320):Math.max(scroll.clientWidth,Math.ceil(series.length*5));', 'var barStep=Math.max(4,Math.min(20,Number(state.chartZoom)||8)),stageWidth=Math.max(scroll.clientWidth,Math.ceil(series.length*barStep+88));', 'real bar stage width');
hr('<button type="button" data-smp-period="5" aria-pressed="false">5日</button>', '<button type="button" data-smp-period="5" aria-pressed="false">5日</button><span class="smp-divider" aria-hidden="true"></span><b>缩放</b><button type="button" data-smp-chart-zoom="out" aria-label="缩小K线">−</button><output id="smp-chart-zoom-label">100%</output><button type="button" data-smp-chart-zoom="in" aria-label="放大K线">＋</button><button type="button" data-smp-chart-zoom="reset">复位</button>', 'chart zoom controls');
hr('function renderModeControls(){', 'function chartZoomPercent(){return Math.round((Number(state.chartZoom)||8)/8*100)}function setChartZoom(action){var levels=[4,6,8,10,12,16,20],current=Number(state.chartZoom)||8,index=levels.indexOf(current);if(index<0)index=2;var scroll=qs("#smp-chart-scroll"),ratio=scroll&&scroll.scrollWidth>0?(scroll.scrollLeft+scroll.clientWidth/2)/scroll.scrollWidth:1;if(action==="in")index=Math.min(levels.length-1,index+1);else if(action==="out")index=Math.max(0,index-1);else index=2;state.chartZoom=levels[index];try{localStorage.setItem("macau-special-chart-zoom",String(state.chartZoom))}catch(error){}clearChartTip();scheduleChart(false);requestAnimationFrame(function(){var s=qs("#smp-chart-scroll");if(s){s.scrollLeft=Math.max(0,ratio*s.scrollWidth-s.clientWidth/2)}});renderChartZoom()}function renderChartZoom(){var out=qs("#smp-chart-zoom-label");if(out)out.textContent=chartZoomPercent()+"%"}function renderModeControls(){', 'chart zoom functions');
hr('renderMaSettings();renderCustomGroups()', 'renderMaSettings();renderCustomGroups();renderChartZoom()', 'render chart zoom');
hr('qs("#smp-window-select").addEventListener("change",function(event){', 'qsa("[data-smp-chart-zoom]").forEach(function(button){button.addEventListener("click",function(){setChartZoom(button.getAttribute("data-smp-chart-zoom"))})});var zoomScroll=qs("#smp-chart-scroll");if(zoomScroll)zoomScroll.addEventListener("wheel",function(event){if(!event.ctrlKey)return;event.preventDefault();setChartZoom(event.deltaY<0?"in":"out")},{passive:false});qs("#smp-window-select").addEventListener("change",function(event){', 'bind chart zoom');
hr('function init(){loadCustomGroups();', 'function init(){try{var savedChartZoom=Number(localStorage.getItem("macau-special-chart-zoom"));if([4,6,8,10,12,16,20].indexOf(savedChartZoom)>=0)state.chartZoom=savedChartZoom}catch(error){}loadCustomGroups();', 'load chart zoom');

// Visual-only lower BOLL pane: keep BBW/%B calculations in the engine, but render candles + UPPER/MID/LOWER like a professional BOLL chart.
const bandStart = '      }else if(indicator==="band"){';
const bandEnd = '      }else{\n        var lowerBase=';
const bandStartIndex = html.indexOf(bandStart);
const bandEndIndex = html.indexOf(bandEnd, bandStartIndex + bandStart.length);
if (bandStartIndex < 0 || bandEndIndex < 0) throw new Error('Lower BOLL visual patch anchors not found');
const bandRender = `      }else if(indicator==="band"){
        var bollValues=[],bandActual=series.filter(function(row){return !row.simulated});
        data.boll.forEach(function(row,index){if(!row)return;bollValues.push(row.upper,row.mid,row.lower);if(series[index])bollValues.push(series[index].open,series[index].close)});
        bollValues=bollValues.filter(Number.isFinite);
        var bandLow=Math.min.apply(null,bollValues),bandHigh=Math.max.apply(null,bollValues),bandPad=Math.max(.35,(bandHigh-bandLow)*.08),mapBand=function(value){return panelTop+(bandHigh+bandPad-value)/(bandHigh-bandLow+bandPad*2||1)*lowerHeight};
        ctx.save();ctx.beginPath();ctx.rect(left,panelTop,cssWidth-left-right,lowerHeight);ctx.clip();
        [0,.5,1].forEach(function(level){var gy=panelTop+lowerHeight*level;ctx.strokeStyle="#253a5488";ctx.lineWidth=1;ctx.setLineDash(level===.5?[]:[3,4]);ctx.beginPath();ctx.moveTo(left,gy);ctx.lineTo(cssWidth-right,gy);ctx.stroke()});ctx.setLineDash([]);
        series.forEach(function(row,index){var x=xFor(index),color=row.hit?"#ef5350":"#18a66a",open=mapBand(row.open),close=mapBand(row.close),barWidth=Math.max(2,step*.56),barTop=Math.min(open,close),barHeight=Math.max(1,Math.abs(close-open));ctx.fillStyle=row.simulated?color+"a6":color;ctx.fillRect(x-barWidth/2,barTop,barWidth,barHeight)});
        line(ctx,data.boll,mapBand,xFor,"#ef5350",1.35,"upper");line(ctx,data.boll,mapBand,xFor,"#38bdf8",1.5,"mid");line(ctx,data.boll,mapBand,xFor,"#22c55e",1.35,"lower");ctx.restore();
        var lastBoll=data.boll.length?data.boll[data.boll.length-1]:null,fmtBand=function(value){return Number.isFinite(value)?(value>=0?"+":"")+value.toFixed(2):"—"};
        ctx.textAlign="left";ctx.font="10px system-ui";ctx.fillStyle="#d7e5f4";ctx.fillText("BOLL(20,2)",left,panelTop+10);if(lastBoll){ctx.fillStyle="#38bdf8";ctx.fillText("MID:"+fmtBand(lastBoll.mid),left+76,panelTop+10);ctx.fillStyle="#ef5350";ctx.fillText("UPPER:"+fmtBand(lastBoll.upper),left+155,panelTop+10);ctx.fillStyle="#22c55e";ctx.fillText("LOWER:"+fmtBand(lastBoll.lower),left+255,panelTop+10)}
`;
html = html.slice(0, bandStartIndex) + bandRender + html.slice(bandEndIndex);

// Add the multi-profile management layer only to the standalone desktop build.
if (!html.includes('id="smp-custom-groups"')) throw new Error('Custom group editor missing before profile injection');
if (!html.includes('data-smp-custom-action="save"')) throw new Error('Legacy save control missing before profile injection');
if (!html.includes('</body>')) throw new Error('Unable to inject profile manager script');
html = html.replace('</body>', '<script src="./custom-profiles.js?v=profiles-v1"></script></body>');
fs.writeFileSync(appHtml, html, 'utf8');
fs.copyFileSync(path.join(__dirname, 'custom-profiles.js'), path.join(appDir, 'custom-profiles.js'));

const verifyHtml = fs.readFileSync(appHtml, 'utf8');
const verifyJs = fs.readFileSync(path.join(appDir, 'custom-profiles.js'), 'utf8');
[
  'custom-profiles.js?v=profiles-v1',
  'id="smp-custom-groups"',
  'data-smp-mode="custom"',
  'data-smp-period="5"',
  'data-smp-chart-zoom="in"',
  'macau-special-chart-zoom',
  'longWindow=false',
  'series.length*barStep+88',
  'BOLL(20,2)',
  'UPPER:',
  'MID:',
  'LOWER:'
].forEach(token => { if (!verifyHtml.includes(token)) throw new Error('Desktop profile/chart snapshot verification failed: ' + token); });
[
  'macau-special-custom-zodiac-profiles-v1',
  '方案名称',
  '已保存组合',
  '新建组合',
  '重命名',
  '删除组合',
  '保存方案',
  '当前方案：'
].forEach(token => { if (!verifyJs.includes(token)) throw new Error('Profile manager verification failed: ' + token); });
console.log('Standalone special-column snapshot + named profiles + real long-window K-line zoom + visual BOLL pane built and verified.');
