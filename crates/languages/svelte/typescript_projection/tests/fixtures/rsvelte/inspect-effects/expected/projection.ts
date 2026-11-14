;

	let a = $state(1);
	let b = $derived(a * 2);
	$inspect(a);
	$inspect(a, b).with(console.trace);
	$inspect(a).with((t, v) => { if (t === 'update') debugger; });
	function f() {
		$inspect.trace('label');
		return a;
	}
	$effect(() => {
		$inspect.trace();
		console.log(a);
	});
	let d = $derived.by(() => {
		$inspect.trace('d');
		return a;
	});

;

async () => {
  if (a) {
    const c = a;
    {
      svelteHTML.createElement("p", {});
      (c);
    }
  }
};
const InspectEffects__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof InspectEffects__SvelteComponent_>} */ (InspectEffects__SvelteComponent_);
