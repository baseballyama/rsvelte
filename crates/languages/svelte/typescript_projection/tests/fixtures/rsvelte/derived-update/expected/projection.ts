;
function $$render() {
  
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const DerivedUpdate__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof DerivedUpdate__SvelteComponent_>} */ (DerivedUpdate__SvelteComponent_);
