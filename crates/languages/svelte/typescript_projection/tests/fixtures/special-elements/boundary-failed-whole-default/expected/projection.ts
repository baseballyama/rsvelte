;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message}={message:"Unknown"},reset) => {
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
const BoundaryFailedWholeDefault__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedWholeDefault__SvelteComponent_;
