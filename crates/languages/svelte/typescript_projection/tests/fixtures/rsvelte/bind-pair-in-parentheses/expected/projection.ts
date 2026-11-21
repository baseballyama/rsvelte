;
function $$render() {
  
	let v = $state(1);

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": __rsvelte_get_set(() => v, (x) => (v = x)),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindPairInParentheses__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindPairInParentheses__SvelteComponent_>} BindPairInParentheses__SvelteComponent_ */
export default BindPairInParentheses__SvelteComponent_;
