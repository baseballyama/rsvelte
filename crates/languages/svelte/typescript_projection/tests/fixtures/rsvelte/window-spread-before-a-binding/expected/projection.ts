;
function $$render() {
  
	let v = $state(1);
	let rest = $state({});

;

  async () => {
    {
      svelteHTML.createElement("svelte:window", {
        "bind:innerWidth": v,
        ...(rest),
      });
      () => {
        // @ts-ignore
        v = __rsvelte_untyped_prop();
      };
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const WindowSpreadBeforeABinding__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof WindowSpreadBeforeABinding__SvelteComponent_>} WindowSpreadBeforeABinding__SvelteComponent_ */
export default WindowSpreadBeforeABinding__SvelteComponent_;
