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
const BoundaryFailedArrayFixed__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedArrayFixed__SvelteComponent_;
