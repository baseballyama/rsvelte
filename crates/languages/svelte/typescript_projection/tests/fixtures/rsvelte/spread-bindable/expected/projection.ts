;
function $$render() {
  
	let /** @type {typeof __rsvelte_public_props0} */ { value = $bindable(), text = $bindable('x'), ...properties } = $props();
  value;
  text;


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
      value;
    }
    {
      svelteHTML.createElement("p", {
        "title": text,
      });
      text;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "value" | "text">} */ (__rsvelte_export_component))();
}
export const SpreadBindable__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SpreadBindable__SvelteComponent_>} SpreadBindable__SvelteComponent_ */
export default SpreadBindable__SvelteComponent_;
