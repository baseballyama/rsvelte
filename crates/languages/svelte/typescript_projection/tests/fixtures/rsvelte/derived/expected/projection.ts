;
function $$render() {
  
	let count = $state(1);
	let double = $derived(count * 2);

	function increment() {
		count += 1;
	}

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": increment,
      });
      count;
      double;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const Derived__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Derived__SvelteComponent_>} Derived__SvelteComponent_ */
export default Derived__SvelteComponent_;
