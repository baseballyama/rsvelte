;
const value=(/[)]/.test("a")?"a":"b");
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const RegexConditional__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type RegexConditional__SvelteComponent_ = ReturnType<typeof RegexConditional__SvelteComponent_>;
export default RegexConditional__SvelteComponent_;
