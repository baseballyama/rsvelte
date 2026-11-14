;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({cause:{message}},reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
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
const BoundaryFailedNested__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedNested__SvelteComponent_>} */ (BoundaryFailedNested__SvelteComponent_);
