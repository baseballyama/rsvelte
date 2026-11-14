;

	let w = $state(0);

;

async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "bind:innerwidth": w,
    });
    () => {
      // @ts-ignore
      w = __rsvelte_untyped_prop();
    };
  }
};
const BindNameSuggestion__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindNameSuggestion__SvelteComponent_>} */ (BindNameSuggestion__SvelteComponent_);
