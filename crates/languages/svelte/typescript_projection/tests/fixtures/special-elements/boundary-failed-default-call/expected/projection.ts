;
function fallback(){return "Unknown"}
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: ({message=fallback()},reset) => {
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
const BoundaryFailedDefaultCall__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryFailedDefaultCall__SvelteComponent_;
