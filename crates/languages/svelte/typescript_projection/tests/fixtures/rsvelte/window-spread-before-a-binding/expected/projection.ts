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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const WindowSpreadBeforeABinding__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof WindowSpreadBeforeABinding__SvelteComponent_>} */ (WindowSpreadBeforeABinding__SvelteComponent_);
