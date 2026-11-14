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
const StateSnapshotIgnored__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof StateSnapshotIgnored__SvelteComponent_>} */ (StateSnapshotIgnored__SvelteComponent_);
