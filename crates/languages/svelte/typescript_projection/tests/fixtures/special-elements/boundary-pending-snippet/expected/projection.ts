;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        pending: () => {
          async () => {
            {
              svelteHTML.createElement("p", {});
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BoundaryPendingSnippet__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryPendingSnippet__SvelteComponent_>} */ (BoundaryPendingSnippet__SvelteComponent_);
