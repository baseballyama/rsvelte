;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed: ([first, ...rest], reset) => {
          async () => {
            {
              svelteHTML.createElement("p", {});
              (first);
              (rest.length);
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
const BoundaryFailedArray__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedArray__SvelteComponent_>} */ (BoundaryFailedArray__SvelteComponent_);
