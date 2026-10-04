;
let value=$state("a");export function set(next){value=next;}export function get(){return value;}
;

{
  svelteHTML.createElement("p", {
    class: get(),
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
