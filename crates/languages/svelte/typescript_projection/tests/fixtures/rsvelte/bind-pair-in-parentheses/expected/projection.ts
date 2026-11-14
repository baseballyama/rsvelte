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
const BindPairInParentheses__SvelteComponent_ = __rsvelte_export_component();
export default BindPairInParentheses__SvelteComponent_;
