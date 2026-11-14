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

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => (d = !d),
    });
    (d);
    (e);
  }
};
const DerivedAssign__SvelteComponent_ = __rsvelte_export_component();
export default DerivedAssign__SvelteComponent_;
