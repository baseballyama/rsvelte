;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message}, reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
          }
          {
            svelteHTML.createElement("button", {
              "onclick": reset,
            });
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
const BoundaryFailedObject__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedObject__SvelteComponent_>} */ (BoundaryFailedObject__SvelteComponent_);
