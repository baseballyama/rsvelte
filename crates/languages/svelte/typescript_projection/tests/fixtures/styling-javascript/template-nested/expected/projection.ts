;
const text=(`a${{value:`b${1}`}.value}`);
;

{
  svelteHTML.createElement("p", {
    class: text,
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
