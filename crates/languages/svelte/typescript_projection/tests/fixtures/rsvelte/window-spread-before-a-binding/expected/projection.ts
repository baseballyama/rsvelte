;

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
const WindowSpreadBeforeABinding__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type WindowSpreadBeforeABinding__SvelteComponent_ = ReturnType<typeof WindowSpreadBeforeABinding__SvelteComponent_>;
export default WindowSpreadBeforeABinding__SvelteComponent_;
