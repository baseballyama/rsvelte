;

	let name = $state('world');

;

async () => {
  {
    svelteHTML.createElement("input", {
      "bind:value": name,
    });
    () => {
      // @ts-ignore
      name = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {});
    (name);
  }
};
const BindValue__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindValue__SvelteComponent_>} */ (BindValue__SvelteComponent_);
