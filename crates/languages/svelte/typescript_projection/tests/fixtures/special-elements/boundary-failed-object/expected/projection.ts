;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message}, reset) => {
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
const BoundaryFailedObject__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedObject__SvelteComponent_;
