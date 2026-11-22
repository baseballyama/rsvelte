;
function $$render() {
  
	let count = $derived(0);
	let after = count++;
	let before = --count;

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      after;
      before;
      count;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DerivedUpdate__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DerivedUpdate__SvelteComponent_>} DerivedUpdate__SvelteComponent_ */
export default DerivedUpdate__SvelteComponent_;
