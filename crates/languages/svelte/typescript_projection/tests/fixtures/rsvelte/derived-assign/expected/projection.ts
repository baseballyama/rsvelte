;
function $$render() {
  
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
      d;
      e;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DerivedAssign__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DerivedAssign__SvelteComponent_>} DerivedAssign__SvelteComponent_ */
export default DerivedAssign__SvelteComponent_;
