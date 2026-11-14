;

	let items = $state([1, 2]);

;

async () => {
  {
    svelteHTML.createElement("p", {});
    ($state.snapshot(items).length);
  }
};
const StateSnapshotInTemplate__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof StateSnapshotInTemplate__SvelteComponent_>} */ (StateSnapshotInTemplate__SvelteComponent_);
