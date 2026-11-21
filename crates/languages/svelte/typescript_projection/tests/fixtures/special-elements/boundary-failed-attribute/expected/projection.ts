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
export const BoundaryFailedAttribute__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryFailedAttribute__SvelteComponent_>} BoundaryFailedAttribute__SvelteComponent_ */
export default BoundaryFailedAttribute__SvelteComponent_;
