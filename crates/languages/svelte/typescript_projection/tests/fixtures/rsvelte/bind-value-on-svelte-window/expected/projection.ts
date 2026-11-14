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
const BindValueOnSvelteWindow__SvelteComponent_ = __rsvelte_export_component();
export default BindValueOnSvelteWindow__SvelteComponent_;
