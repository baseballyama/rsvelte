;
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
const BoundaryFailedArray__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedArray__SvelteComponent_;
