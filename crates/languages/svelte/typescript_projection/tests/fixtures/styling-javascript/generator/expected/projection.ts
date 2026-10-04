;
function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

{
  svelteHTML.createElement("p", {
    class: value,
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
