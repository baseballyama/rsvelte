;
let pattern=$state(/a/g);
;

{
  svelteHTML.createElement("p", {
    class: pattern.test("a") ? "a" : "b",
  });
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
