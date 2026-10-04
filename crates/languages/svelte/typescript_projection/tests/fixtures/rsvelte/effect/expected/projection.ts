;

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

() => {
  {
    svelteHTML.createElement("button", {
      onclick: () => n++,
    });
    (n);
    (f());
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
