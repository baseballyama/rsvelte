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

() => {
  if (a) {
    const c = a;
    {
      svelteHTML.createElement("p", {});
      (c);
    }
  }
};
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
