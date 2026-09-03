(function(){
  try{
    if(parent!==window){
      var d=parent.document;
      var b=d.getElementById('close');
      var m=d.getElementById('backdrop');
      if(b&&m){
        b.onclick=function(e){
          if(e)e.preventDefault();
          m.hidden=true;
        };
      }
    }
  }catch(e){}
})();
