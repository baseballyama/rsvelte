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
const BoundaryPendingSnippet__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryPendingSnippet__SvelteComponent_;
