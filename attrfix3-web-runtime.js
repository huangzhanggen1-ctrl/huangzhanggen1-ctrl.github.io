document.write('<script src="./v7-attribute-frozen-specs.js?v=20260904-attrfix3"><\/script><script src="./attribute-kline-bridge.js?v=20260904-attrfix3"><\/script><script src="./attrfix3-attribute-panel.js?v=20260904-attrfix3"><\/script>');
(function(){
'use strict';
var VERSION='ATTRFIX3-WEB-RC1';
function mean(values){return values.length?values.reduce(function(a,b){return a+Number(b||0)},0)/values.length:0}
function sum(values){return values.reduce(function(a,b){return a+Number(b||0)},0)}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,Number(v)||0))}
function missStats(values){var current=0,longest=0;values.forEach(function(value){current=value?0:current+1;longest=Math.max(longest,current)});return{longest:longest,current:current}}
function summarize(records,span){
 var sample=records.slice(-Math.min(Number(span)||records.length,records.length)),n=sample.length,top={};
 [1,2,3].forEach(function(k){var hits=sum(sample.map(function(r){return r['hit'+k]})),rate=n?hits/n:0,legacy=n?mean(sample.map(function(r){return r['base'+k]})):0,exact=n?mean(sample.map(function(r){var v=Number(r['exactBase'+k]);return Number.isFinite(v)?v:Number(r['base'+k])||0})):0,miss=missStats(sample.map(function(r){return r['hit'+k]})),informative=sample.some(function(r){return r['informative'+k]!==false});top['top'+k]={hits:hits,n:n,rate:rate,baseline:legacy,lift:legacy>0?rate/legacy:null,liftPoints:rate-legacy,exactBaseline:exact,exactLift:exact>0?rate/exact:null,exactLiftPoints:rate-exact,informative:informative,longestMiss:miss.longest,currentMiss:miss.current}});
 var q=sample.filter(function(r){return r.qualified}),u=sample.filter(function(r){return !r.qualified}),qh=sum(q.map(function(r){return r.hit1})),uh=sum(u.map(function(r){return r.hit1})),qb=q.length?mean(q.map(function(r){var v=Number(r.exactBase1);return Number.isFinite(v)?v:Number(r.base1)||0})):0,ub=u.length?mean(u.map(function(r){var v=Number(r.exactBase1);return Number.isFinite(v)?v:Number(r.base1)||0})):0,qrate=q.length?qh/q.length:0,urate=u.length?uh/u.length:0;
 return{span:span,label:'近'+span+'期',n:n,top:top,coverage:n?q.length/n:0,qualified:q.length,qualifiedHits:qh,qualifiedHitRate:qrate,qualifiedExactBaseline:qb,qualifiedExactLift:qb>0?qrate/qb:null,unqualified:u.length,unqualifiedHits:uh,unqualifiedHitRate:urate,unqualifiedExactBaseline:ub,unqualifiedExactLift:ub>0?urate/ub:null,exactBaselineMethod:sample.every(function(r){return r.exactBaselineMethod==='P0_PARTITION'})?'P0_PARTITION':'MIXED_OR_LEGACY',rate:top.top3.rate,base:top.top3.baseline,lift:top.top3.lift};
}
function wrapEngine(api){
 if(!api||api.__ATTRFIX3_WEB__===VERSION||typeof api.walkForward!=='function')return api;
 var original=api.walkForward.bind(api);
 function patched(candidateSets,options){
  var result=original(candidateSets,options);
  if(!result||!result.ok||!Array.isArray(result.records))return result;
  try{
   var cfg=api.configWith(options&&options.config),sets=(Array.isArray(candidateSets)?candidateSets:[]).map(function(item,index){var validation=api.validateRows(item&&item.rows,{minimum:cfg.minimumHistory});return{id:String(item&&item.id!=null?item.id:index),rows:validation.ok?api.enrichRows(validation.excludedSimulated?validation.rows:item.rows,cfg):[]}}).filter(function(item){return item.rows.length}),byId={};sets.forEach(function(item){byId[item.id]=item.rows});
   var records=result.records.map(function(row){var r=Object.assign({},row),target=Number(r.targetIndex),ids=Array.isArray(r.ranking)?r.ranking.slice():sets.map(function(x){return x.id}),p0={};ids.forEach(function(id){var rows=byId[id],v=Number(rows&&rows[target]&&rows[target].p0);p0[id]=Number.isFinite(v)?clamp(v,0,1):null});var all=ids.map(function(id){return p0[id]}),totalP0=all.every(Number.isFinite)?sum(all):NaN,exactPartition=Number(r.positives)===1&&Number.isFinite(totalP0)&&Math.abs(totalP0-1)<=1e-6,total=ids.length;
    [1,2,3].forEach(function(k){var picks=Math.min(k,total),selected=ids.slice(0,picks),legacy=Number(r['base'+k])||0;r['exactBase'+k]=exactPartition?clamp(sum(selected.map(function(id){return p0[id]})),0,1):legacy;r['informative'+k]=picks<total});r.exactBaselineMethod=exactPartition?'P0_PARTITION':'LEGACY_RANDOM_COVER';return r});
   var spans=(result.windows||[]).map(function(w){return w.span}).filter(function(v){return v!=null});if(!spans.length)spans=(cfg.walkWindows||[30,50,100,160]).slice();var windows=spans.map(function(span){return summarize(records,span)});
   return Object.assign({},result,{records:records,ledger:records,windows:windows,attrfix3:{version:VERSION,displayOnly:true,method:'P0_PARTITION'}});
  }catch(error){console.error('ATTRFIX3 wrapper failed; legacy audit preserved',error);return result}
 }
 var wrapped=Object.assign({},api,{walkForward:patched,__ATTRFIX3_WEB__:VERSION});try{return Object.freeze(wrapped)}catch(e){return wrapped}
}
(function intercept(){
 var current=globalThis.MacauKlineV7;
 if(current){globalThis.MacauKlineV7=wrapEngine(current);return}
 try{Object.defineProperty(globalThis,'MacauKlineV7',{configurable:true,get:function(){return current},set:function(value){current=wrapEngine(value);try{Object.defineProperty(globalThis,'MacauKlineV7',{configurable:true,writable:true,enumerable:true,value:current})}catch(e){}}})}catch(e){}
})();
function pct(value){return((Number(value)||0)*100).toFixed(1)+'%'}
function exactHtml(audit){
 if(!audit||!audit.ok)return'';
 function cell(metric){if(metric&&metric.informative===false)return '<span class="v7f-chip">全覆盖 · 无判别力</span>';var base=metric&&Number.isFinite(Number(metric.exactBaseline))?Number(metric.exactBaseline):Number(metric&&metric.baseline)||0,lift=base>0?Number(metric.rate)/base:null;return metric.hits+'/'+metric.n+' · '+pct(metric.rate)+'／'+pct(base)+'／'+(lift==null?'—':lift.toFixed(2)+'×')}
 function qcell(row){if(!row.qualified)return'0次 · 无统计';var base=Number(row.qualifiedExactBaseline||0),lift=base>0?row.qualifiedHitRate/base:null,cls=lift!=null&&lift<.9?' class="v7f-bad"':lift!=null&&lift>1.1?' class="v7f-good"':'';return'<span'+cls+'>'+row.qualifiedHits+'/'+row.qualified+' · '+pct(row.qualifiedHitRate)+'／'+pct(base)+'／'+(lift==null?'—':lift.toFixed(2)+'×')+'</span>'}
 var latest=audit.windows&&audit.windows.length?audit.windows[audit.windows.length-1]:null,warning=latest&&latest.qualified&&latest.qualifiedExactLift!=null&&latest.qualifiedExactLift<.9?'<p class="v7f-warning">⚠ 达标层当前低于精确随机基准（Lift '+latest.qualifiedExactLift.toFixed(2)+'×）；“达标”仅作研究观察，不代表更高命中能力。</p>':'';
 return'<div class="v7f-table"><table><thead><tr><th>窗口</th><th>Top1／精确基准／Lift</th><th>Top2／精确基准／Lift</th><th>Top3／精确基准／Lift</th><th>Coverage</th><th>达标命中／精确基准／Lift</th><th>最长／当前未中</th></tr></thead><tbody>'+audit.windows.map(function(row){return'<tr><td>'+row.label+'</td><td>'+cell(row.top.top1)+'</td><td>'+cell(row.top.top2)+'</td><td>'+cell(row.top.top3)+'</td><td>'+row.qualified+'/'+row.n+' · '+pct(row.coverage)+'</td><td>'+qcell(row)+'</td><td>'+row.top.top1.longestMiss+'／'+row.top.top1.currentMiss+'</td></tr>'}).join('')+'</tbody></table></div>'+warning+'<p class="v7f-foot">ATTRFIX3审计口径：精确基准优先取每期TopK实际号码集合的P0总和；只用于统计审计和显示，不反向改历史排名、闸门、Pair证据或冻结账本。二分制Top2/Top3、三分类Top3等全覆盖结果直接标记“无判别力”。</p>';
}
var queued=false;
function patchUi(){queued=false;var ui=globalThis.MacauKlineV7UI;if(!ui||typeof ui.getAudit!=='function')return;document.querySelectorAll('.v7f[data-v7-key]').forEach(function(host){var key=host.getAttribute('data-v7-key')||'special',audit=ui.getAudit(key);if(!audit||!audit.attrfix3)return;var details=Array.from(host.querySelectorAll('details')).find(function(d){var s=d.querySelector('summary');return s&&String(s.textContent).indexOf('严格Walk-Forward')>=0});if(!details)return;var body=details.querySelector('.v7f-detail');if(!body)return;var sig=VERSION+'|'+(audit.records&&audit.records.length||0)+'|'+(audit.records&&audit.records.length?audit.records[audit.records.length-1].target:'');if(body.getAttribute('data-attrfix3')===sig)return;body.innerHTML=exactHtml(audit);body.setAttribute('data-attrfix3',sig)})}
function queuePatch(){if(queued)return;queued=true;(globalThis.requestAnimationFrame||setTimeout)(patchUi)}
try{new MutationObserver(queuePatch).observe(document.documentElement,{subtree:true,childList:true})}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queuePatch,{once:true});else queuePatch();setTimeout(queuePatch,250);setTimeout(queuePatch,1200);
globalThis.__XINMACAU_ATTRFIX3_WEB__={version:VERSION};
})();
