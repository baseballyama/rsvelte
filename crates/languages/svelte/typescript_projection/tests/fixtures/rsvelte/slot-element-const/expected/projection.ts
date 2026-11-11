;

	import C from "./C.svelte";
	let k = $state(1);

;

() => {
  {
    __rsvelte_component(C)(__rsvelte_internals(), {});
    {
      svelteHTML.createElement("p", {
        "slot": "a",
      });
      const twice = k * 2;
      (twice);
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => k++,
    });
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
