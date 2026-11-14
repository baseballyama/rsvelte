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
const BindUnknownName__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindUnknownName__SvelteComponent_ = ReturnType<typeof BindUnknownName__SvelteComponent_>;
export default BindUnknownName__SvelteComponent_;
