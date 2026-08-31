(function(){
'use strict';
var STORE='macau_user_draws_v1';
var FORMAL=[
{label:'2026-232',date:'2026-08-20',nums:[29,10,17,4,46,20,42],zodiac:['虎','鸡','虎','兔','鸡','猪','牛']},
{label:'2026-233',date:'2026-08-21',nums:[18,41,5,49,4,34,7],zodiac:['牛','虎','虎','马','兔','鸡','鼠']},
{label:'2026-234',date:'2026-08-22',nums:[25,30,37,19,7,17,39],zodiac:['马','牛','马','鼠','鼠','虎','龙']},
{label:'2026-235',date:'2026-08-23',nums:[27,26,35,17,44,21,32],zodiac:['龙','蛇','猴','虎','猪','狗','猪']},
{label:'2026-236',date:'2026-08-24',nums:[26,35,42,9,14,17,11],zodiac:['蛇','猴','牛','狗','蛇','虎','猴']}
];
var ZODIACS=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
var CNY=[
{from:'2022-02-01',animal:'虎'},
{from:'2023-01-22',animal:'兔'},
{from:'2024-02-10',animal:'龙'},
{from:'2025-01-29',animal:'蛇'},
{from:'2026-02-17',animal:'马'},
{from:'2027-02-06',animal:'羊'},
{from:'2028-01-26',animal:'猴'},
{from:'2029-02-13',animal:'鸡'},
{from:'2030-02-03',animal:'狗'}
];
function yearAnimal(date){if(!/^20\d{2}-\d{2}-\d{2}$/.test(String(date||'')))return null;var selected=null;for(var i=0;i<CNY.length;i+=1){if(String(date)>=CNY[i].from)selected=CNY[i].animal;else break}return selected}
function zodiacForNumber(number,date){var anchor=yearAnimal(date);if(!anchor)return null;return ZODIACS[(ZODIACS.indexOf(anchor)-(Number(number)-1)+1200)%12]}
function labelForDate(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return '';var y=Number(iso.slice(0,4)),t=Date.parse(iso+'T00:00:00Z');if(!Number.isFinite(t))return '';var d=Math.floor((t-Date.UTC(y,0,1))/86400000)+1;return iso.slice(0,4)+'-'+String(d).padStart(3,'0')}
function normalizeRow(row){if(!row||!/^20\d{2}-\d{3}$/.test(String(row.label||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date||'')))return null;var label=String(row.label),date=String(row.date);if(labelForDate(date)!==label)return null;var nums=Array.isArray(row.nums)?row.nums.map(Number):[];if(nums.length!==7||nums.some(function(n){return !Number.isInteger(n)||n<1||n>49})||new Set(nums).size!==7)return null;var zodiac=nums.map(function(n){return zodiacForNumber(n,date)});if(zodiac.some(function(z){return !z}))return null;var out={};Object.keys(row).forEach(function(k){out[k]=row[k]});out.label=label;out.date=date;out.nums=nums;out.zodiac=zodiac;return out}
function validRow(row){return normalizeRow(row)}
function readLocal(){try{var x=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function merge(base){var rows=(Array.isArray(base)?base:[]).map(normalizeRow).filter(Boolean);var byLabel=new Map(rows.map(function(r){return[r.label,r]}));FORMAL.map(normalizeRow).filter(Boolean).forEach(function(r){byLabel.set(r.label,r)});var officialLabels=new Set(byLabel.keys()),pending=[];readLocal().forEach(function(raw){var r=validRow(raw);if(!r||officialLabels.has(r.label))return;byLabel.set(r.label,r);pending.push(r)});pending.sort(function(a,b){return a.label.localeCompare(b.label)});try{localStorage.setItem(STORE,JSON.stringify(pending))}catch(e){}return Array.from(byLabel.values()).sort(function(a,b){return a.label.localeCompare(b.label)})}
try{Object.defineProperty(globalThis,'__MACAU_DRAWS__',{configurable:true,get:function(){return undefined},set:function(value){var merged=merge(value);Object.defineProperty(globalThis,'__MACAU_DRAWS__',{configurable:true,writable:true,enumerable:true,value:merged});globalThis.__MACAU_RUNTIME_DATA__={latest:merged.length?merged[merged.length-1].label:'—',count:merged.length,localCount:readLocal().length}}})}catch(e){console.error('Macau data bootstrap failed',e)}
function refreshBadge(){var rows=globalThis.__MACAU_DRAWS__;if(!Array.isArray(rows)||!rows.length)return;var latest=rows[rows.length-1],badge=document.getElementById('offline-badge');if(badge)badge.textContent='离线单文件 · 截至'+latest.label+' · 共'+rows.length+'期 · 不经过chatgpt.site'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshBadge,{once:true});else refreshBadge();setTimeout(refreshBadge,0);
})();