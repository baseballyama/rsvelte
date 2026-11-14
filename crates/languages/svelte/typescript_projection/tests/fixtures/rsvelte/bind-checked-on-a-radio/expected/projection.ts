;

	let v = $state(false);

;

async () => {
  {
    svelteHTML.createElement("input", {
      "type": "radio",
      "bind:checked": v,
    });
    () => {
      // @ts-ignore
      v = __rsvelte_untyped_prop();
    };
  }
};
const BindCheckedOnARadio__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindCheckedOnARadio__SvelteComponent_>} */ (BindCheckedOnARadio__SvelteComponent_);
