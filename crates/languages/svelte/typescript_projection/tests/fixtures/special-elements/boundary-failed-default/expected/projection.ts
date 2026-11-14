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
const BoundaryFailedDefault__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedDefault__SvelteComponent_;
