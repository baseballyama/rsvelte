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
const DerivedUpdate__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DerivedUpdate__SvelteComponent_ = ReturnType<typeof DerivedUpdate__SvelteComponent_>;
export default DerivedUpdate__SvelteComponent_;
