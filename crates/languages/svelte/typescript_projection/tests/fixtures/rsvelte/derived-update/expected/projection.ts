;

	let count = $derived(0);
	let after = count++;
	let before = --count;

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (after);
    (before);
    (count);
  }
};
const DerivedUpdate__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DerivedUpdate__SvelteComponent_>} */ (DerivedUpdate__SvelteComponent_);
