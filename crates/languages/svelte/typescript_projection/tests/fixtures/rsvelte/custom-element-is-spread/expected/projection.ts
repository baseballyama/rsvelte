;
function $$render() {
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
  return (/** @type {typeof __rsvelte_export_component<any, {}, "">} */ (__rsvelte_export_component))();
}
const CustomElementIsSpread__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof CustomElementIsSpread__SvelteComponent_>} */ (CustomElementIsSpread__SvelteComponent_);
