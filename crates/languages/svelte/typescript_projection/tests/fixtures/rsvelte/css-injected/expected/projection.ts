;

	let { children }: typeof __rsvelte_public_props0 = $props();
	let x = $state(1);

;

const __rsvelte_public_props0 = __rsvelte_props({
  children: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  {
    svelteHTML.createElement("svelte:options", {
      "css": "injected",
    });
  }
  {
    svelteHTML.createElement("p", {
      "class": "a",
      "onclick": () => x++,
    });
    (x);
  }
  __rsvelte_ensure_snippet(children?.());
};
const CssInjected__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type CssInjected__SvelteComponent_ = ReturnType<typeof CssInjected__SvelteComponent_>;
export default CssInjected__SvelteComponent_;
