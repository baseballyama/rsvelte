;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
    {
      svelteHTML.createElement("svelte:boundary", {});
      {
        svelteHTML.createElement("svelte:boundary", {});
        {
          svelteHTML.createElement("p", {});
        }
      }
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BoundaryNested__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryNested__SvelteComponent_>} */ (BoundaryNested__SvelteComponent_);
