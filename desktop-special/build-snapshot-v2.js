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
