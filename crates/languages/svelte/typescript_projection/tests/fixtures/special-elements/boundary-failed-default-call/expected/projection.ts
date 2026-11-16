;
function $$render() {
  function fallback(){return "Unknown"}
;

  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({message=fallback()},reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              message;
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const BoundaryFailedDefaultCall__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedDefaultCall__SvelteComponent_>} */ (BoundaryFailedDefaultCall__SvelteComponent_);
