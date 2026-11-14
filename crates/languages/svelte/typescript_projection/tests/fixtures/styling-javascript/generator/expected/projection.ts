;
function* values(){yield "a";yield* ["b"];}const value=values().next().value;
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const Generator__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Generator__SvelteComponent_>} */ (Generator__SvelteComponent_);
