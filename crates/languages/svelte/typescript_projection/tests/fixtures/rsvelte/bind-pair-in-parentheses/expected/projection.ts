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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindPairInParentheses__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindPairInParentheses__SvelteComponent_>} */ (BindPairInParentheses__SvelteComponent_);
