;
function $$render() {
  
	let value = $state({ f: () => {} });
	// svelte-ignore state_snapshot_uncloneable
	const copy = $state.snapshot(value);

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      copy.f;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const StateSnapshotIgnored__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof StateSnapshotIgnored__SvelteComponent_>} StateSnapshotIgnored__SvelteComponent_ */
export default StateSnapshotIgnored__SvelteComponent_;
