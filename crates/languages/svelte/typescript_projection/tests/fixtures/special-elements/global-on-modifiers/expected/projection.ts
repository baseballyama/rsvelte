;
async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "on:click": ()=>{},
    });
  }
  {
    svelteHTML.createElement("svelte:document", {
      "on:touchmove": ()=>{},
    });
  }
  {
    svelteHTML.createElement("svelte:body", {
      "on:keydown": ()=>{},
    });
  }
};
const GlobalOnModifiers__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof GlobalOnModifiers__SvelteComponent_>} */ (GlobalOnModifiers__SvelteComponent_);
