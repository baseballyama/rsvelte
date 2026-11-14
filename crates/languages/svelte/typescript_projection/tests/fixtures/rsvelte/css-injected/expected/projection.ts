;

	/** @type {typeof __rsvelte_public_props0} */ let { children } = $props();
	let x = $state(1);

;

const __rsvelte_public_props0 = __rsvelte_props({
  children: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
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
const CssInjected__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof CssInjected__SvelteComponent_>} */ (CssInjected__SvelteComponent_);
