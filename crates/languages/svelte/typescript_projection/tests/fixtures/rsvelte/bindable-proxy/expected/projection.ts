;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { items = $bindable([]), config = $bindable({ open: false }) } = $props();
  items;
  config;


;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    items: __rsvelte_array_prop(),
    config: __rsvelte_record_prop(),
  }, false);
  async () => {
    {
      svelteHTML.createElement("button", {
        "type": "button",
        "onclick": () => items.push(items.length),
      });
      (items.length);
    }
    {
      svelteHTML.createElement("p", {});
      (config.open);
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "items" | "config">} */ (__rsvelte_export_component))();
}
const BindableProxy__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindableProxy__SvelteComponent_>} */ (BindableProxy__SvelteComponent_);
