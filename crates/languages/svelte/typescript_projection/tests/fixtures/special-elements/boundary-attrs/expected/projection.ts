;
function onerror(error, reset) { console.log(error); } function failed() {}
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      onerror,
      failed,
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryAttrs__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryAttrs__SvelteComponent_>} */ (BoundaryAttrs__SvelteComponent_);
