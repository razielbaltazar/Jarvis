const test=require('node:test');const assert=require('node:assert/strict');
const {capabilityInventory}=require('./capability-inventory.cjs');
test('classifies validated, connection-dependent and native-only capabilities',()=>{
 const rows=capabilityInventory('Available tools (4):\n  read_file\n  jarvis_calendar\n  desktop_preview\n  delegate_task');
 assert.deepEqual(Object.fromEntries(rows.map(row=>[row.name,row.status])),{delegate_task:'available',desktop_preview:'native_only',jarvis_calendar:'connection_required',read_file:'validated'});
});
test('ignores headings, malformed names and duplicates',()=>{
 assert.deepEqual(capabilityInventory('Available tools:\n read_file\n read_file\n bad tool'),[{name:'read_file',status:'validated'}]);
});
