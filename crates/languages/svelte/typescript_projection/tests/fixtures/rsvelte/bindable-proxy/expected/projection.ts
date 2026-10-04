;

	let { items = $bindable([]), config = $bindable({ open: false }) }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  items: __rsvelte_empty_array([]),
  config: { open: false },
}, false);
{
  svelteHTML.createElement("button", {
    type: "button",
    onclick: () => items.push(items.length),
  });
  (items.length);
}
{
  svelteHTML.createElement("p", {});
  (config.open);
}
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "items" | "config">();
