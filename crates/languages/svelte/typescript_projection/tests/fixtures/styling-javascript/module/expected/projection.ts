;
export const value="a";export function get(){return value;}
;

const local=get();
;

{
  svelteHTML.createElement("p", {
    class: local,
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
