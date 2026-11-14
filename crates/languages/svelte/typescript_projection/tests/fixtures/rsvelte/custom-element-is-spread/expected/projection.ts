;
let props = $props();
;

async () => {
  {
    svelteHTML.createElement("button", {
      "is": "x-button",
    });
  }
  {
    svelteHTML.createElement("button", {
      "is": "x-button",
      ...(props),
    });
  }
};
const CustomElementIsSpread__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof CustomElementIsSpread__SvelteComponent_>} */ (CustomElementIsSpread__SvelteComponent_);
