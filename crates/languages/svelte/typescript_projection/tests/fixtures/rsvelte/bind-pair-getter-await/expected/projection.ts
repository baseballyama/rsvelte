;

	let v = $state(1);
	const p = Promise.resolve(1);

;

async () => {
  {
    svelteHTML.createElement("input", {
      "bind:value": __rsvelte_get_set(async () => await p, (nv) => (v = nv)),
    });
  }
};
const BindPairGetterAwait__SvelteComponent_ = __rsvelte_export_component();
export default BindPairGetterAwait__SvelteComponent_;
