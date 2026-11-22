;
function $$render() {
  let /** @type {typeof __rsvelte_public_props0} */ { pending } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    pending: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      svelteHTML.createElement("svelte:boundary", {
        pending,
      });
      {
        svelteHTML.createElement("p", {});
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryPendingAttribute__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryPendingAttribute__SvelteComponent_>} BoundaryPendingAttribute__SvelteComponent_ */
export default BoundaryPendingAttribute__SvelteComponent_;
