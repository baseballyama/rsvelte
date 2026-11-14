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
const BindChecked__SvelteComponent_ = __rsvelte_export_component();
export default BindChecked__SvelteComponent_;
