;
function $$render() {
  
	let n = $state(0);

	$effect(() => {
		console.log(n);
	});

	$effect.pre(() => console.log(n));

	function f() {
		$effect(() => {});
		return 1;
	}

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => n++,
      });
      n;
      f();
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const Effect__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Effect__SvelteComponent_>} Effect__SvelteComponent_ */
export default Effect__SvelteComponent_;
