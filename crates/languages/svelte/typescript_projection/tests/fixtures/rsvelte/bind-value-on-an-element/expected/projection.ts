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
const BindValueOnAnElement__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindValueOnAnElement__SvelteComponent_ = ReturnType<typeof BindValueOnAnElement__SvelteComponent_>;
export default BindValueOnAnElement__SvelteComponent_;
