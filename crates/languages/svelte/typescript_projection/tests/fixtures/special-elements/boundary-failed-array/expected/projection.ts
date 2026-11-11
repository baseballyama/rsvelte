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
const BoundaryFailedArray__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedArray__SvelteComponent_ = ReturnType<typeof BoundaryFailedArray__SvelteComponent_>;
export default BoundaryFailedArray__SvelteComponent_;
