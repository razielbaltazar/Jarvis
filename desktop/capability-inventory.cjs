'use strict';
const nativeOnly=new Set(['read_terminal','close_terminal','desktop_preview','drive_preview','annotate_preview','read_window_below','focus_pane','react_to_message','gui_tour','show_tip']);
const validated=new Set(['read_file','write_file','patch','terminal','execute_code','memory','session_search','skills_list','skill_view','todo_list','browser_navigate','browser_snapshot','jarvis_records','clarify']);
const connectionRequired=new Set(['jarvis_calendar']);

function capabilityInventory(output){
 const names=String(output||'').split(/\r?\n/).map(row=>row.trim()).filter(row=>/^[a-z][a-z0-9_]*$/i.test(row));
 return [...new Set(names)].sort().map(name=>({
  name,
  status:nativeOnly.has(name)?'native_only':connectionRequired.has(name)?'connection_required':validated.has(name)?'validated':'available'
 }));
}
module.exports={capabilityInventory};
