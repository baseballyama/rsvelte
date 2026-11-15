;
function $$render() {
  const values=["a","b"];
;

  async () => {
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
  return __rsvelte_export_component<__rsvelte_no_props, {}, "">();
}
const EachAssertion__SvelteComponent_ = $$render();
type EachAssertion__SvelteComponent_ = ReturnType<typeof EachAssertion__SvelteComponent_>;
export default EachAssertion__SvelteComponent_;
