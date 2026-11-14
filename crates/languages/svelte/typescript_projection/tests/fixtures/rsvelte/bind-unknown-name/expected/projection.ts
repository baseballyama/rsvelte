;

	let w = $state(0);

;

async () => {
  {
    svelteHTML.createElement("div", {
      "bind:whatever": w,
    });
    () => {
      // @ts-ignore
      w = __rsvelte_untyped_prop();
    };
  }
};
const BindUnknownName__SvelteComponent_ = __rsvelte_export_component();
export default BindUnknownName__SvelteComponent_;
