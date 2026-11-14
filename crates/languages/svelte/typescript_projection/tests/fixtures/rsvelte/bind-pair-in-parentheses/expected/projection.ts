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
const BindPairInParentheses__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindPairInParentheses__SvelteComponent_ = ReturnType<typeof BindPairInParentheses__SvelteComponent_>;
export default BindPairInParentheses__SvelteComponent_;
