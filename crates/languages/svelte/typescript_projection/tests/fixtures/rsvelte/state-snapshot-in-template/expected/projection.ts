;

	let items = $state([1, 2]);

;

() => {
  {
    svelteHTML.createElement("p", {});
    ($state.snapshot(items).length);
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
