;

	let value = $state({ f: () => {} });
	// svelte-ignore state_snapshot_uncloneable
	const copy = $state.snapshot(value);

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (copy.f);
  }
};
const StateSnapshotIgnored__SvelteComponent_ = __rsvelte_export_component();
export default StateSnapshotIgnored__SvelteComponent_;
