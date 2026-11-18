;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ({cause:{message}},reset) => {
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
const BoundaryFailedNested__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedNested__SvelteComponent_>} */ (BoundaryFailedNested__SvelteComponent_);
