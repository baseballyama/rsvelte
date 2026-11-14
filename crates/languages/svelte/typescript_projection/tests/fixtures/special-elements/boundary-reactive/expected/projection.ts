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
const BoundaryReactive__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryReactive__SvelteComponent_>} */ (BoundaryReactive__SvelteComponent_);
