;

	let agreed = $state(false);

;

async () => {
  {
    svelteHTML.createElement("label", {});
    {
      svelteHTML.createElement("input", {
        "type": "checkbox",
        "bind:checked": agreed,
      });
      () => {
        // @ts-ignore
        agreed = __rsvelte_untyped_prop();
      };
    }
  }
  if (agreed) {
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const BindChecked__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindChecked__SvelteComponent_ = ReturnType<typeof BindChecked__SvelteComponent_>;
export default BindChecked__SvelteComponent_;
