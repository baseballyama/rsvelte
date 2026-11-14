;

	let { items = $bindable([]), config = $bindable({ open: false }) } = $props();

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
const BindableProxy__SvelteComponent_ = __rsvelte_export_component();
export default BindableProxy__SvelteComponent_;
