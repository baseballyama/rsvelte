;

	let v = $state("");

;

async () => {
  {
    svelteHTML.createElement("p", {});
    (v);
  }
  {
    svelteHTML.createElement("input", {
      "bind:value": v,
    });
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
  }
};
const BindValueOnAnElement__SvelteComponent_ = __rsvelte_export_component();
export default BindValueOnAnElement__SvelteComponent_;
