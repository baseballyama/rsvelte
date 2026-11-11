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
const BoundaryReactive__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BoundaryReactive__SvelteComponent_ = ReturnType<typeof BoundaryReactive__SvelteComponent_>;
export default BoundaryReactive__SvelteComponent_;
