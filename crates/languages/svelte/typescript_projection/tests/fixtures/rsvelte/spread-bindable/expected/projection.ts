;
function $$render() {
  
	let /** @typedef {{ value?: any, text?: string } & Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ { value = $bindable(), text = $bindable('x'), ...properties } = $props();
  value;
  text;


;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "value" | "text">} */ (__rsvelte_export_component))();
}
export const SpreadBindable__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SpreadBindable__SvelteComponent_>} SpreadBindable__SvelteComponent_ */
export default SpreadBindable__SvelteComponent_;
