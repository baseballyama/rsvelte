;

	let name = $state('world');

;

() => {
  {
    svelteHTML.createElement("input", {
      "bind:value": name,
    });
    () => {
      // @ts-ignore
      name = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {});
    (name);
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
