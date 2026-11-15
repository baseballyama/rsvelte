;
function $$render() {
  function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const Generator__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Generator__SvelteComponent_>} */ (Generator__SvelteComponent_);
