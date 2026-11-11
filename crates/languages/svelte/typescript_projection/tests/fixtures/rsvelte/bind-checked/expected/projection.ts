;

	let agreed = $state(false);

;

() => {
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
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
