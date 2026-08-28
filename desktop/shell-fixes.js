(function(){
  'use strict';
  var STORE='macau_user_draws_v1';
  var byId=function(id){return document.getElementById(id)};
  var modal=byId('backdrop');
  var close=byId('close');
  var update=byId('update');
  var save=byId('save');
  var del=byId('deleteLast');
  var meta=byId('meta');
  var head=document.querySelector('.latestHead');

  function closeModal(event){
    if(event){event.preventDefault();event.stopPropagation();}
    if(!modal)return;
    modal.hidden=true;
    modal.setAttribute('aria-hidden','true');
    modal.style.removeProperty('display');
  }
  function openModalCleanup(){
    if(!modal)return;
    modal.style.removeProperty('display');
    modal.removeAttribute('aria-hidden');
    repairDrawInputs();
  }
  window.__closeDrawModal=closeModal;
  if(close){
    ['click','pointerup','touchend'].forEach(function(type){
      close.addEventListener(type,closeModal,{capture:true,passive:false});
    });
  }
  if(update)update.addEventListener('click',function(){setTimeout(openModalCleanup,0)},true);
  if(modal)modal.addEventListener('pointerdown',function(event){if(event.target===modal)closeModal(event)},true);
  document.addEventListener('keydown',function(event){if(event.key==='Escape'&&modal&&!modal.hidden)closeModal(event)},true);

  function drawInputs(){return Array.prototype.slice.call(document.querySelectorAll('#nums input'));}
  function repairDrawInputs(){
    drawInputs().forEach(function(input,index){
      input.disabled=false;
      input.readOnly=false;
      input.removeAttribute('disabled');
      input.removeAttribute('readonly');
      input.setAttribute('type','text');
      input.setAttribute('inputmode','numeric');
      input.setAttribute('autocomplete','off');
      input.setAttribute('tabindex',String(index+1));
      input.style.pointerEvents='auto';
      input.style.userSelect='text';
      input.style.webkitUserSelect='text';
    });
  }
  function focusNumberInput(event){
    var target=event.target;
    if(!target||!target.matches||!target.matches('#nums input'))return;
    target.disabled=false;
    target.readOnly=false;
    try{target.focus({preventScroll:true});}catch(error){try{target.focus();}catch(ignore){}}
  }
  document.addEventListener('pointerdown',focusNumberInput,true);
  document.addEventListener('mousedown',focusNumberInput,true);
  document.addEventListener('click',focusNumberInput,true);
  document.addEventListener('focusin',function(event){if(event.target&&event.target.matches&&event.target.matches('#nums input'))repairDrawInputs()},true);
  repairDrawInputs();

  var style=document.createElement('style');
  style.textContent='.desktopHistoryBtn{min-height:40px;padding:8px 12px;border:1px solid #31506e;border-radius:10px;background:#10263d;color:#dce8f6;font-weight:900}.desktopHistory{margin-top:8px;max-height:210px;overflow:auto;border:1px solid #29415b;border-radius:10px;background:#071522}.desktopHistory[hidden]{display:none!important}.desktopHistoryRow{display:grid;grid-template-columns:90px 100px 1fr;gap:8px;padding:8px 10px;border-bottom:1px solid #1d344c;align-items:center;font-size:11px}.desktopHistoryRow:last-child{border-bottom:0}.desktopHistoryRow b{color:#ffe28a}.desktopHistoryRow span{color:#a9bdd2}.desktopHistoryEmpty{padding:12px;color:#91a8c1;font-size:11px}.latestHeadActions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#nums input{pointer-events:auto!important;user-select:text!important;-webkit-user-select:text!important;cursor:text!important}@media(max-width:700px){.desktopHistoryRow{grid-template-columns:72px 86px 1fr}.desktopHistoryBtn,.update{padding:7px 9px}}';
  document.head.appendChild(style);

  var historyBtn=null,history=null;
  if(head&&update&&meta){
    var actions=document.createElement('div');actions.className='latestHeadActions';
    update.parentNode.insertBefore(actions,update);actions.appendChild(update);
    historyBtn=document.createElement('button');historyBtn.type='button';historyBtn.className='desktopHistoryBtn';historyBtn.textContent='历史开奖';actions.insertBefore(historyBtn,update);
    history=document.createElement('div');history.className='desktopHistory';history.hidden=true;meta.insertAdjacentElement('afterend',history);
  }

  function safeRows(){
    try{
      var rows=JSON.parse(localStorage.getItem(STORE)||'[]');
      return Array.isArray(rows)?rows.filter(function(row){return row&&Array.isArray(row.nums)&&row.nums.length===7}).sort(function(a,b){return String(b.label||'').localeCompare(String(a.label||''))}):[];
    }catch(error){return[]}
  }
  function pad(value){return String(value).padStart(2,'0')}
  function renderHistory(){
    if(!history)return;
    var rows=safeRows();
    if(!rows.length){history.innerHTML='<div class="desktopHistoryEmpty">当前没有手工历史开奖。正式历史可在下方K线的历史回看中滚动查询。</div>';return;}
    history.innerHTML=rows.map(function(row){
      var nums=row.nums.map(function(n,i){return pad(n)+(row.zodiac&&row.zodiac[i]?row.zodiac[i]:'')+(i===6?'（特）':'')}).join(' · ');
      return '<div class="desktopHistoryRow"><b>'+String(row.label||'')+'</b><span>'+String(row.date||'')+'</span><span>'+nums+'</span></div>';
    }).join('');
  }
  if(historyBtn){historyBtn.addEventListener('click',function(){history.hidden=!history.hidden;historyBtn.textContent=history.hidden?'历史开奖':'收起历史';if(!history.hidden)renderHistory()})}
  if(save)save.addEventListener('click',function(){setTimeout(renderHistory,50)},false);
  if(del)del.addEventListener('click',function(){setTimeout(renderHistory,50)},false);
  renderHistory();
})();
