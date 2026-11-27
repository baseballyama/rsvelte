;
function $$render() {
  let /** @typedef {{ failed: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { failed } = $props();
;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryFailedAttribute__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryFailedAttribute__SvelteComponent_>} BoundaryFailedAttribute__SvelteComponent_ */
export default BoundaryFailedAttribute__SvelteComponent_;
