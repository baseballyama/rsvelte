;
function $$render() {
  
	let n = $state(1);
	let d = $derived(2);

;

  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-el",
      });
    }
    {
      svelteHTML.createElement("p", {});
      n;
    }
    {
      svelteHTML.createElement("p", {
        "title": d,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const CustomElementStateIsASource__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CustomElementStateIsASource__SvelteComponent_>} CustomElementStateIsASource__SvelteComponent_ */
export default CustomElementStateIsASource__SvelteComponent_;
