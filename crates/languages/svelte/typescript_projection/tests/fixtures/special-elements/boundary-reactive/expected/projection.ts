;
function $$render() {
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BoundaryReactive__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BoundaryReactive__SvelteComponent_>} BoundaryReactive__SvelteComponent_ */
export default BoundaryReactive__SvelteComponent_;
