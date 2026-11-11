;

	let items = $state([1, 2]);

;

() => {
  {
    svelteHTML.createElement("p", {});
    ($state.snapshot(items).length);
  }
};
const StateSnapshotInTemplate__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type StateSnapshotInTemplate__SvelteComponent_ = ReturnType<typeof StateSnapshotInTemplate__SvelteComponent_>;
export default StateSnapshotInTemplate__SvelteComponent_;
