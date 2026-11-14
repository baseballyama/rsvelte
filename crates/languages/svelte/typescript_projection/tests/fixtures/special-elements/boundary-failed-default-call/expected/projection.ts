;
function fallback(){return "Unknown"}
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message=fallback()},reset) => {
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
const BoundaryFailedDefaultCall__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedDefaultCall__SvelteComponent_>} */ (BoundaryFailedDefaultCall__SvelteComponent_);
