;

	let { items = $bindable([]), config = $bindable({ open: false }) }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  items: __rsvelte_array_prop(),
  config: __rsvelte_record_prop(),
}, false);
() => {
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
const BindableProxy__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "items" | "config">();
type BindableProxy__SvelteComponent_ = ReturnType<typeof BindableProxy__SvelteComponent_>;
export default BindableProxy__SvelteComponent_;
