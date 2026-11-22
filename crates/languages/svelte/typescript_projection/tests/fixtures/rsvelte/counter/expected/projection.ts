;
function $$render() {
  
	let count = $state(0);

;

  async () => {
    {
      svelteHTML.createElement("button", {
        "onclick": () => count++,
      });
      count;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const Counter__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Counter__SvelteComponent_>} Counter__SvelteComponent_ */
export default Counter__SvelteComponent_;
