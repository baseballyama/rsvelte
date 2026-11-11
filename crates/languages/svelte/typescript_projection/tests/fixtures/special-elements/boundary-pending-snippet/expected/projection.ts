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
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryPendingSnippet__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryPendingSnippet__SvelteComponent_ = ReturnType<typeof BoundaryPendingSnippet__SvelteComponent_>;
export default BoundaryPendingSnippet__SvelteComponent_;
