;

	/** @type {typeof __rsvelte_public_props0} */ let { value = $bindable(), text = $bindable('x'), ...properties } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  value: __rsvelte_untyped_prop(),
  text: 'x',
}, true);
async () => {
  {
    svelteHTML.createElement("button", {
      ...(properties),
      "onclick": () => value++,
    });
    (value);
  }
  {
    svelteHTML.createElement("p", {
      "title": text,
    });
    (text);
  }
};
const SpreadBindable__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "value" | "text">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SpreadBindable__SvelteComponent_>} */ (SpreadBindable__SvelteComponent_);
