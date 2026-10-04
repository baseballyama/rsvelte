;
const value="a";export function get(){return value;}
;

const value="b";
;

{
  svelteHTML.createElement("p", {
    class: value,
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
