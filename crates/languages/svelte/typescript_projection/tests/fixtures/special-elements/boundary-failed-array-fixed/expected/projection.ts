;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ([first,,third],reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (first);
            (third);
          }
        };
        return __rsvelte_snippet_return;
      },
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryFailedArrayFixed__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedArrayFixed__SvelteComponent_>} */ (BoundaryFailedArrayFixed__SvelteComponent_);
