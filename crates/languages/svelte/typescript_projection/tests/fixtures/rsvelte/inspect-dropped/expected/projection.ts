;
function $$render() {
  
	let a = $state(1);
	let b = $derived(a * 2);
	$inspect(a, b);
	$inspect(a).with(console.trace);
	function f() {
		$inspect.trace('f');
		$inspect(b);
		return a;
	}

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => { $inspect(a); a++; },
      });
      f();
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const InspectDropped__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof InspectDropped__SvelteComponent_>} InspectDropped__SvelteComponent_ */
export default InspectDropped__SvelteComponent_;
