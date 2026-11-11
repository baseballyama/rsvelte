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
      "onclick": () => (d = !d),
    });
    (d);
    (e);
  }
};
const DerivedAssign__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type DerivedAssign__SvelteComponent_ = ReturnType<typeof DerivedAssign__SvelteComponent_>;
export default DerivedAssign__SvelteComponent_;
