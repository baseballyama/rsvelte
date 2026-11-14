;
async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message, ...rest}, reset) => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (message);
            (rest.name);
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
const BoundaryFailedRest__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedRest__SvelteComponent_;
