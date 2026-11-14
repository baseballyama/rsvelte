;
let onerror = $state(() => {});
;

async () => {
  {
    svelteHTML.createElement("svelte:boundary", {
      onerror,
    });
    {
      svelteHTML.createElement("p", {});
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => onerror = () => {},
    });
  }
};
const BoundaryReactive__SvelteComponent_ = __rsvelte_export_component();
export default BoundaryReactive__SvelteComponent_;
