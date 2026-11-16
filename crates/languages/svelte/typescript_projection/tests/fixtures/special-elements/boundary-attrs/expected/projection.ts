;
function $$render() {
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const BoundaryAttrs__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryAttrs__SvelteComponent_>} */ (BoundaryAttrs__SvelteComponent_);
