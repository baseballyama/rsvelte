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
const BoundarySnippets__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundarySnippets__SvelteComponent_ = ReturnType<typeof BoundarySnippets__SvelteComponent_>;
export default BoundarySnippets__SvelteComponent_;
