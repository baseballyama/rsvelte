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
const BoundaryFailedSnippet__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedSnippet__SvelteComponent_ = ReturnType<typeof BoundaryFailedSnippet__SvelteComponent_>;
export default BoundaryFailedSnippet__SvelteComponent_;
