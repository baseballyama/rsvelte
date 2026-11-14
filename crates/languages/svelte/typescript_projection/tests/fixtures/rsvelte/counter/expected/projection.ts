;

	let count = $state(0);

;

async () => {
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
  }
};
const Counter__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Counter__SvelteComponent_>} */ (Counter__SvelteComponent_);
