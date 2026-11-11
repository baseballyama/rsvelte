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
const StateSnapshotIgnored__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StateSnapshotIgnored__SvelteComponent_ = ReturnType<typeof StateSnapshotIgnored__SvelteComponent_>;
export default StateSnapshotIgnored__SvelteComponent_;
