;
const items=Array.from({length:2},(_,i)=>({text:`a${i}`}));
;

{
  svelteHTML.createElement("p", {
    class: items[0].text,
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
