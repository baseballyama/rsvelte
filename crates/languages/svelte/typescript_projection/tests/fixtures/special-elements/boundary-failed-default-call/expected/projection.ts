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
const BoundaryFailedDefaultCall__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryFailedDefaultCall__SvelteComponent_ = ReturnType<typeof BoundaryFailedDefaultCall__SvelteComponent_>;
export default BoundaryFailedDefaultCall__SvelteComponent_;
