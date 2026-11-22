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
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const EachAssertion__SvelteComponent_ = $$render();
type EachAssertion__SvelteComponent_ = InstanceType<typeof EachAssertion__SvelteComponent_>;
export default EachAssertion__SvelteComponent_;
