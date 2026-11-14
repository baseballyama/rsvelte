;

	let v = $state(0);

;

async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "bind:value": v,
    });
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
  }
};
const BindValueOnSvelteWindow__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindValueOnSvelteWindow__SvelteComponent_>} */ (BindValueOnSvelteWindow__SvelteComponent_);
