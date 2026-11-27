;
function $$render() {
  let /** @typedef {{ pending: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { pending } = $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryPendingAttribute__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryPendingAttribute__SvelteComponent_>} BoundaryPendingAttribute__SvelteComponent_ */
export default BoundaryPendingAttribute__SvelteComponent_;
