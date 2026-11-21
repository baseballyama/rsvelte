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
export const CustomElementIsSpread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CustomElementIsSpread__SvelteComponent_>} CustomElementIsSpread__SvelteComponent_ */
export default CustomElementIsSpread__SvelteComponent_;
