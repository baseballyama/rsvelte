;

	let text = $state('hi');

;

async () => {
  {
    svelteHTML.createElement("pre", {});
    (text);
  }
  {
    svelteHTML.createElement("pre", {});
  }
  {
    svelteHTML.createElement("pre", {});
    {
      svelteHTML.createElement("code", {});
      (text);
    }
  }
  {
    svelteHTML.createElement("button", {
      "type": "button",
      "onclick": () => (text += '!'),
    });
  }
};
const Pre__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Pre__SvelteComponent_>} */ (Pre__SvelteComponent_);
