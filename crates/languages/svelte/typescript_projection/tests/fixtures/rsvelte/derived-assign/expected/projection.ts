;

	let a = $state(1);
	let d = $derived(a * 2);
	let e = $derived.by(() => a);
	function f() {
		d = 5;
		d += 1;
		e ||= 3;
	}

;

() => {
  {
    svelteHTML.createElement("button", {
      onclick: () => (d = !d),
    });
    (d);
    (e);
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
