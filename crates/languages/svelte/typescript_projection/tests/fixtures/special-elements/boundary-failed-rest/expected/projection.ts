;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message, ...rest}, reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
            (rest.name);
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
const BoundaryFailedRest__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedRest__SvelteComponent_>} */ (BoundaryFailedRest__SvelteComponent_);
