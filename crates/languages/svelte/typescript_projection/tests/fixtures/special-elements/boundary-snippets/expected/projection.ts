;
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
const BoundarySnippets__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundarySnippets__SvelteComponent_>} */ (BoundarySnippets__SvelteComponent_);
