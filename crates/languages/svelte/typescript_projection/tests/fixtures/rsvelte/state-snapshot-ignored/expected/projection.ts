;

	let value = $state({ f: () => {} });
	// svelte-ignore state_snapshot_uncloneable
	const copy = $state.snapshot(value);

;

() => {
  {
    svelteHTML.createElement("p", {});
    (copy.f);
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
