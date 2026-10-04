;
const f=(pattern=/[(){}]/) => pattern.test("a");
;

() => {
  {
    svelteHTML.createElement("p", {
      class: f() ? "a" : "b",
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
