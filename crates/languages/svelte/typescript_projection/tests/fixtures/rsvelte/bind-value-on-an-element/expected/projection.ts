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
const BindValueOnAnElement__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindValueOnAnElement__SvelteComponent_>} */ (BindValueOnAnElement__SvelteComponent_);
