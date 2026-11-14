;

	let v = $state(1);

;

async () => {
  {
    svelteHTML.createElement("input", {
      "bind:value": __rsvelte_get_set(() => v, (x) => (v = x)),
    });
  }
};
const BindPairInParentheses__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindPairInParentheses__SvelteComponent_>} */ (BindPairInParentheses__SvelteComponent_);
