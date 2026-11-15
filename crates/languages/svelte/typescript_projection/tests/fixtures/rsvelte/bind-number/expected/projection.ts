;
function $$render() {
  
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindNumber__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindNumber__SvelteComponent_>} */ (BindNumber__SvelteComponent_);
