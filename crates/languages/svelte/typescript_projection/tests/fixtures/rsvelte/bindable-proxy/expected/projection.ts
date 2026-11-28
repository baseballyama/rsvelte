;
function $$render() {
  
	let /** @typedef {{ items?: any[], config?: Record<string, any> }} $$ComponentProps *//** @type {$$ComponentProps} */ { items = $bindable([]), config = $bindable({ open: false }) } = $props();
  items;
  config;


;

  async () => {
    {
      svelteHTML.createElement("button", {
        "type": "button",
        "onclick": () => items.push(items.length),
      });
      items.length;
    }
    {
      svelteHTML.createElement("p", {});
      config.open;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "items" | "config">} */ (__rsvelte_export_component))();
}
export const BindableProxy__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindableProxy__SvelteComponent_>} BindableProxy__SvelteComponent_ */
export default BindableProxy__SvelteComponent_;
