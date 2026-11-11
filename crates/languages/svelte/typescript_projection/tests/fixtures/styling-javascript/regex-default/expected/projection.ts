;
const f=(pattern=/[(){}]/) => pattern.test("a");
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": f() ? "a" : "b",
    });
  }
};
const RegexDefault__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type RegexDefault__SvelteComponent_ = ReturnType<typeof RegexDefault__SvelteComponent_>;
export default RegexDefault__SvelteComponent_;
