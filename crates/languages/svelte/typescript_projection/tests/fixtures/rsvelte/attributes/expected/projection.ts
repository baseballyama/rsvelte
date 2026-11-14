;

	let { href, label }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  href: __rsvelte_untyped_prop(),
  label: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    svelteHTML.createElement("a", {
      href,
      "class": "link",
      "title": `go to ${label}`,
    });
    (label);
  }
};
const Attributes__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type Attributes__SvelteComponent_ = ReturnType<typeof Attributes__SvelteComponent_>;
export default Attributes__SvelteComponent_;
