;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: (error, reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (error.message);
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
const BoundaryFailedSnippet__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedSnippet__SvelteComponent_>} */ (BoundaryFailedSnippet__SvelteComponent_);
