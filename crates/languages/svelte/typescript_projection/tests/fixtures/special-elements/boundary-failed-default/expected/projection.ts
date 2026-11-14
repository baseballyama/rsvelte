;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message = "Unknown"}, reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
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
const BoundaryFailedDefault__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedDefault__SvelteComponent_ = ReturnType<typeof BoundaryFailedDefault__SvelteComponent_>;
export default BoundaryFailedDefault__SvelteComponent_;
