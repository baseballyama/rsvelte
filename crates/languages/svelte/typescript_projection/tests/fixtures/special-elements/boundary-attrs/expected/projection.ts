;
function onerror(error, reset) { console.log(error); } function failed() {}
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      onerror,
      failed,
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BoundaryAttrs__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryAttrs__SvelteComponent_;
