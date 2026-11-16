;
function $$render() {
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const BoundaryFailedObject__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedObject__SvelteComponent_>} */ (BoundaryFailedObject__SvelteComponent_);
