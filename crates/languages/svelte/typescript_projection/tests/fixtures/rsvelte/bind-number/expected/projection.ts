;

	let a = $state(1);
	let b = $state(2);
	let sum = $derived(a + b);

;

async () => {
  {
    svelteHTML.createElement("input", {
      "type": "number",
      "bind:value": a,
    });
    () => {
      // @ts-ignore
      a = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("input", {
      "type": "range",
      "min": "0",
      "max": "10",
      "bind:value": b,
    });
    () => {
      // @ts-ignore
      b = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {});
    (a);
    (b);
    (sum);
  }
};
const BindNumber__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindNumber__SvelteComponent_ = ReturnType<typeof BindNumber__SvelteComponent_>;
export default BindNumber__SvelteComponent_;
