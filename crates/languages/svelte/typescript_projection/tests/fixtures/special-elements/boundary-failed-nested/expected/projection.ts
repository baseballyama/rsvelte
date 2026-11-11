;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({cause:{message}},reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
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
const BoundaryFailedNested__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedNested__SvelteComponent_ = ReturnType<typeof BoundaryFailedNested__SvelteComponent_>;
export default BoundaryFailedNested__SvelteComponent_;
