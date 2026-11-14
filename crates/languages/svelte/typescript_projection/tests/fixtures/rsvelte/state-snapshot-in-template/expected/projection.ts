;

	let items = $state([1, 2]);

;

async () => {
  {
    svelteHTML.createElement("p", {});
    ($state.snapshot(items).length);
  }
};
const StateSnapshotInTemplate__SvelteComponent_ = __rsvelte_export_component();
export default StateSnapshotInTemplate__SvelteComponent_;
