const test=require('node:test'),assert=require('node:assert/strict');
const {modelOptions,modelCommand}=require('./model-controls.cjs');
test('only vetted configured Gemini text models reach renderer',()=>{
 const result=modelOptions({model:'gemini-3.1-flash-lite',api_key:'private',providers:[{slug:'other',models:['paid']},{slug:'gemini',api_key:'secret',models:['gemini-3.1-flash-lite',{id:'gemini-3.8-flash'},'gemini-3.8-flash','gemini-3-pro','gemini-3.8-flash-image']}]});
 assert.deepEqual(result.models.map(row=>row.id),['gemini-3.1-flash-lite','gemini-3.8-flash']);
 assert.ok(!JSON.stringify(result).includes('secret'));assert.ok(!JSON.stringify(result).includes('private'));
 assert.equal(modelCommand('gemini-3.8-flash',result),'gemini-3.8-flash --provider gemini --session');
 assert.throws(()=>modelCommand('gemini-3-pro',result));
 assert.throws(()=>modelCommand('gemini-3.5-flash-lite',result));
 assert.throws(()=>modelCommand('gemini-3.8-flash --global',result));
});
test('no configured provider leaves current model alone',()=>{
 assert.deepEqual(modelOptions({model:'jarvis-local',providers:[]}).models,[]);
});
