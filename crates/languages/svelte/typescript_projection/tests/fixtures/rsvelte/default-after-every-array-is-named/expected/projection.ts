;
function $$render() {
  
	let [a = () => { let [x] = $state([1]); return x; }, [b]] = $state([]);

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      a();
      b;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const DefaultAfterEveryArrayIsNamed__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof DefaultAfterEveryArrayIsNamed__SvelteComponent_>} DefaultAfterEveryArrayIsNamed__SvelteComponent_ */
export default DefaultAfterEveryArrayIsNamed__SvelteComponent_;
