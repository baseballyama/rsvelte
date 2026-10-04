;

	let { href, label }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  href: __rsvelte_untyped_prop(),
  label: __rsvelte_untyped_prop(),
}, {}, false);
{
  svelteHTML.createElement("a", {
    href,
    class: "link",
    title: `go to ${label}`,
  });
  (label);
}
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
