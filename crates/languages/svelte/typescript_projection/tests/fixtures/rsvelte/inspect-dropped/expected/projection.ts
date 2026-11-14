;

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
    (f());
  }
};
const InspectDropped__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof InspectDropped__SvelteComponent_>} */ (InspectDropped__SvelteComponent_);
