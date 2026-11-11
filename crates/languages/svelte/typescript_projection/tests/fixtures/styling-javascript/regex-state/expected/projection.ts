;
let pattern=$state(/a/g);
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": pattern.test("a") ? "a" : "b",
    });
  }
};
const RegexState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type RegexState__SvelteComponent_ = ReturnType<typeof RegexState__SvelteComponent_>;
export default RegexState__SvelteComponent_;
