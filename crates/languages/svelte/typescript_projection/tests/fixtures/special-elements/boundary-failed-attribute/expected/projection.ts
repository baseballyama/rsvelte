;
function $$render() {
  /** @type {typeof __rsvelte_public_props0} */ let { failed } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    failed: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        failed,
      });
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const BoundaryFailedAttribute__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BoundaryFailedAttribute__SvelteComponent_>} */ (BoundaryFailedAttribute__SvelteComponent_);
