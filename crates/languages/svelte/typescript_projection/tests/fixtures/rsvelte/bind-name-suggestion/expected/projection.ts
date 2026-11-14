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
const BindNameSuggestion__SvelteComponent_ = __rsvelte_export_component();
export default BindNameSuggestion__SvelteComponent_;
