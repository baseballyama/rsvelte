;
function $$render() {
  
	class Counter {
		count = $state(0);
	}

	const counter = new Counter();

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => counter.count++,
      });
      counter.count;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ClassStateField__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ClassStateField__SvelteComponent_>} ClassStateField__SvelteComponent_ */
export default ClassStateField__SvelteComponent_;
