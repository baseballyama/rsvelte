;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ([first,,third],reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (first);
            (third);
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
const BoundaryFailedArrayFixed__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedArrayFixed__SvelteComponent_ = ReturnType<typeof BoundaryFailedArrayFixed__SvelteComponent_>;
export default BoundaryFailedArrayFixed__SvelteComponent_;
