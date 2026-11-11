;

	let count = $state(0);

;

() => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
