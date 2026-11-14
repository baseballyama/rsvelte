;

	/** @type {typeof __rsvelte_public_props0} */ let { children, ...rest } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  children: __rsvelte_untyped_prop(),
}, {}, true);
async () => {
  {
    svelteHTML.createElement("div", {
      ...(rest),
    });
  }
  {
    svelteHTML.createElement("section", {
      "id": "main",
      ...(rest),
      "title": "after",
    });
  }
  {
    svelteHTML.createElement("button", {
      ...(rest),
    });
  }
  {
    svelteHTML.createElement("img", {
      ...(rest),
      "alt": "",
    });
  }
};
const Spread__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof Spread__SvelteComponent_>} */ (Spread__SvelteComponent_);
