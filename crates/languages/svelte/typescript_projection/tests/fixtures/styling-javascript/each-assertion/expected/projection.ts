;
const values=["a","b"];
;

() => {
  {
    for (let [i, value] of __rsvelte_each(values as string[])) {
      (i);
      {
        svelteHTML.createElement("p", {
          "class": value,
        });
      }
    }
  }
};
const EachAssertion__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type EachAssertion__SvelteComponent_ = ReturnType<typeof EachAssertion__SvelteComponent_>;
export default EachAssertion__SvelteComponent_;
