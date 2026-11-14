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
const BindChecked__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindChecked__SvelteComponent_>} */ (BindChecked__SvelteComponent_);
