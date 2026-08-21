(function(){
'use strict';
var STORE='macau_user_draws_v1';
var FORMAL_232={label:'2026-232',date:'2026-08-20',nums:[29,10,17,4,46,20,42],zodiac:['虎','鸡','虎','兔','鸡','猪','牛']};
var ZODIAC={1:'马',13:'马',25:'马',37:'马',49:'马',12:'羊',24:'羊',36:'羊',48:'羊',11:'猴',23:'猴',35:'猴',47:'猴',10:'鸡',22:'鸡',34:'鸡',46:'鸡',9:'狗',21:'狗',33:'狗',45:'狗',8:'猪',20:'猪',32:'猪',44:'猪',7:'鼠',19:'鼠',31:'鼠',43:'鼠',6:'牛',18:'牛',30:'牛',42:'牛',5:'虎',17:'虎',29:'虎',41:'虎',4:'兔',16:'兔',28:'兔',40:'兔',3:'龙',15:'龙',27:'龙',39:'龙',2:'蛇',14:'蛇',26:'蛇',38:'蛇'};
function validRow(row){
  if(!row||!/^2026-\d{3}$/.test(String(row.label||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(row.date||'')))return null;
  var nums=Array.isArray(row.nums)?row.nums.map(Number):[];
  if(nums.length!==7||nums.some(function(n){return !Number.isInteger(n)||n<1||n>49})||new Set(nums).size!==7)return null;
  return {label:String(row.label),date:String(row.date),nums:nums,zodiac:nums.map(function(n){return ZODIAC[n]})};
}
function readLocal(){try{var x=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function merge(base){
  var rows=Array.isArray(base)?base.slice():[];
  var byLabel=new Map(rows.map(function(r){return [r.label,r]}));
  if(!byLabel.has(FORMAL_232.label))byLabel.set(FORMAL_232.label,FORMAL_232);
  var officialLabels=new Set(byLabel.keys());
  var pending=[];
  readLocal().forEach(function(raw){
    var r=validRow(raw);if(!r)return;
    if(officialLabels.has(r.label))return;
    byLabel.set(r.label,r);pending.push(r);
  });
  pending.sort(function(a,b){return a.label.localeCompare(b.label)});
  try{localStorage.setItem(STORE,JSON.stringify(pending))}catch(e){}
  return Array.from(byLabel.values()).sort(function(a,b){return a.label.localeCompare(b.label)});
}
try{
  Object.defineProperty(globalThis,'__MACAU_DRAWS__',{configurable:true,get:function(){return undefined},set:function(value){
    var merged=merge(value);
    Object.defineProperty(globalThis,'__MACAU_DRAWS__',{configurable:true,writable:true,enumerable:true,value:merged});
    globalThis.__MACAU_RUNTIME_DATA__={latest:merged.length?merged[merged.length-1].label:'—',count:merged.length,localCount:readLocal().length};
  }});
}catch(e){console.error('Macau data bootstrap failed',e)}
function refreshBadge(){
  var rows=globalThis.__MACAU_DRAWS__;
  if(!Array.isArray(rows)||!rows.length)return;
  var latest=rows[rows.length-1];
  var badge=document.getElementById('offline-badge');
  if(badge)badge.textContent='离线单文件 · 截至'+latest.label+' · 共'+rows.length+'期 · 不经过chatgpt.site';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshBadge,{once:true});else refreshBadge();
setTimeout(refreshBadge,0);
})();
