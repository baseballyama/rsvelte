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
const BoundaryFailedWholeDefault__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedWholeDefault__SvelteComponent_ = ReturnType<typeof BoundaryFailedWholeDefault__SvelteComponent_>;
export default BoundaryFailedWholeDefault__SvelteComponent_;
