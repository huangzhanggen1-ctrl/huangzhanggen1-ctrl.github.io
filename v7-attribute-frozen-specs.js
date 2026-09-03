/* XinMacau V7.0.4 — Canonical Fixed Attribute Specs · ATTRFIX1
 * Single source of truth for attribute Kline and validation.
 * 波色与五行均为永久固定01–49映射；开奖年份不得改变号码归属。
 * 2026-09-02：内外码按确认口径纠正；内码=09-13/16-20/23-27/30-34/37-41，外码为其补集。
 */
(function(root){
  'use strict';
  var spec = {
  "schema": "xinmacau-v7-attribute-frozen-specs-v2-fixed-mapping",
  "freezeId": "XINMACAU-V7-ATTRIBUTE-FIXED-MAPPING-20260902-ATTRFIX1",
  "status": "FROZEN_CONSTRUCTION_CONTRACT_FIXED_MAPPING_ATTRFIX1",
  "numberDomain": {"min":1,"max":49},
  "fixed": {
    "waveColor":{"groups":{"红波":{"label":"红波","numbers":[1,2,7,8,12,13,18,19,23,24,29,30,34,35,40,45,46]},"蓝波":{"label":"蓝波","numbers":[3,4,9,10,14,15,20,25,26,31,36,37,41,42,47,48]},"绿波":{"label":"绿波","numbers":[5,6,11,16,17,21,22,27,28,32,33,38,39,43,44,49]}}},
    "fiveHead":{"groups":{"0头":{"label":"0头","numbers":[1,2,3,4,5,6,7,8,9]},"1头":{"label":"1头","numbers":[10,11,12,13,14,15,16,17,18,19]},"2头":{"label":"2头","numbers":[20,21,22,23,24,25,26,27,28,29]},"3头":{"label":"3头","numbers":[30,31,32,33,34,35,36,37,38,39]},"4头":{"label":"4头","numbers":[40,41,42,43,44,45,46,47,48,49]}}},
    "middleEdge":{"groups":{"中数":{"label":"中数","numbers":[13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37]},"边数":{"label":"边数","numbers":[1,2,3,4,5,6,7,8,9,10,11,12,38,39,40,41,42,43,44,45,46,47,48,49]}}},
    "heavenEarth":{"groups":{"天码":{"label":"天码","numbers":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]},"地码":{"label":"地码","numbers":[26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49]}}},
    "highLow":{"groups":{"低码":{"label":"低码","numbers":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]},"高码":{"label":"高码","numbers":[25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49]}}},
    "leftRight":{"groups":{"左码":{"label":"左码","numbers":[1,2,3,4,8,9,10,11,15,16,17,18,22,23,24,29,30,31,36,37,38,43,44,45]},"右码":{"label":"右码","numbers":[5,6,7,12,13,14,19,20,21,25,26,27,28,32,33,34,35,39,40,41,42,46,47,48,49]}}},
    "innerOuter":{"groups":{"内码":{"label":"内码","numbers":[9,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30,31,32,33,34,37,38,39,40,41]},"外码":{"label":"外码","numbers":[1,2,3,4,5,6,7,8,14,15,21,22,28,29,35,36,42,43,44,45,46,47,48,49]}}},
    "frontBack":{"groups":{"前码":{"label":"前码","numbers":[1,2,3,4,5,6,7,8,17,18,19,20,21,22,23,24,33,34,35,36,37,38,39,40]},"后码":{"label":"后码","numbers":[9,10,11,12,13,14,15,16,25,26,27,28,29,30,31,32,41,42,43,44,45,46,47,48,49]}}},
    "element":{"groups":{"金":{"label":"金","numbers":[4,5,12,13,26,27,34,35,42,43]},"木":{"label":"木","numbers":[8,9,16,17,24,25,38,39,46,47]},"水":{"label":"水","numbers":[1,14,15,22,23,30,31,44,45]},"火":{"label":"火","numbers":[2,3,10,11,18,19,32,33,40,41,48,49]},"土":{"label":"土","numbers":[6,7,20,21,28,29,36,37]}}}
  },
  "sentinels":[
    {"mode":"waveColor","number":31,"group":"蓝波"},{"mode":"waveColor","number":32,"group":"绿波"},
    {"mode":"fiveHead","number":9,"group":"0头"},{"mode":"fiveHead","number":10,"group":"1头"},
    {"mode":"middleEdge","number":12,"group":"边数"},{"mode":"middleEdge","number":13,"group":"中数"},{"mode":"middleEdge","number":37,"group":"中数"},{"mode":"middleEdge","number":38,"group":"边数"},
    {"mode":"heavenEarth","number":25,"group":"天码"},{"mode":"heavenEarth","number":26,"group":"地码"},
    {"mode":"highLow","number":24,"group":"低码"},{"mode":"highLow","number":25,"group":"高码"},
    {"mode":"leftRight","number":4,"group":"左码"},{"mode":"leftRight","number":5,"group":"右码"},
    {"mode":"innerOuter","number":1,"group":"外码"},{"mode":"innerOuter","number":9,"group":"内码"},
    {"mode":"frontBack","number":8,"group":"前码"},{"mode":"frontBack","number":9,"group":"后码"},
    {"mode":"element","number":4,"group":"金"},{"mode":"element","number":8,"group":"木"},{"mode":"element","number":1,"group":"水"},{"mode":"element","number":2,"group":"火"},{"mode":"element","number":6,"group":"土"}
  ],
  "provenance":{"waveColor":"permanent fixed 01-49 mapping; same mapping for all years","element":"permanent fixed 01-49 mapping; same mapping for all years; audited from tagged historical ledger covering all 49 numbers with zero label conflicts","binaryModes":"current frozen construction contract; boundary sentinels are build-blocking","fixedMappingPolicy":"waveColor and element never resolve by draw year; year must not alter membership","innerOuter":"corrected 2026-09-02 to user-confirmed fixed mapping: inner=09-13/16-20/23-27/30-34/37-41; outer=complement"}
};
  var aliases={"wave":"waveColor","waveColor":"waveColor","color":"waveColor","波色":"waveColor","element":"element","elements":"element","fiveElements":"element","五行":"element","head":"fiveHead","heads":"fiveHead","headNumber":"fiveHead","头数":"fiveHead","五头":"fiveHead","fiveHead":"fiveHead","middleEdge":"middleEdge","centerEdge":"middleEdge","middleBorder":"middleEdge","中边数":"middleEdge","heavenEarth":"heavenEarth","skyEarth":"heavenEarth","天地码":"heavenEarth","highLow":"highLow","highlow":"highLow","高低码":"highLow","leftRight":"leftRight","leftright":"leftRight","左右码":"leftRight","innerOuter":"innerOuter","insideOutside":"innerOuter","内外码":"innerOuter","frontBack":"frontBack","frontRear":"frontBack","前后码":"frontBack"};
  function keyOf(mode){return aliases[String(mode)]||String(mode)}
  function getDefinition(mode,year){return spec.fixed[keyOf(mode)]||null}
  function getGroups(mode,year){var def=getDefinition(mode,year);return def&&def.groups?def.groups:null}
  Object.defineProperty(spec,'getDefinition',{value:getDefinition,enumerable:false});
  Object.defineProperty(spec,'getGroups',{value:getGroups,enumerable:false});
  function deepFreeze(value){if(!value||typeof value!=='object'||Object.isFrozen(value))return value;Object.getOwnPropertyNames(value).forEach(function(key){deepFreeze(value[key])});return Object.freeze(value)}
  deepFreeze(spec);
  root.MACAU_ATTRIBUTE_SPECS=spec;root.__MACAU_ATTRIBUTE_SPECS__=spec;root.MacauAttributeSpecs=spec;root.XinMacauAttributeSpecs=spec;
  if(typeof window!=='undefined'){window.MACAU_ATTRIBUTE_SPECS=spec;window.__MACAU_ATTRIBUTE_SPECS__=spec;window.MacauAttributeSpecs=spec;window.XinMacauAttributeSpecs=spec}
  if(typeof module==='object'&&module.exports)module.exports=spec;
})(typeof globalThis!=='undefined'?globalThis:this);
