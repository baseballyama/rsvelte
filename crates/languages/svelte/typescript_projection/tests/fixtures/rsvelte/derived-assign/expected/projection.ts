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
const DerivedAssign__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof DerivedAssign__SvelteComponent_>} */ (DerivedAssign__SvelteComponent_);
