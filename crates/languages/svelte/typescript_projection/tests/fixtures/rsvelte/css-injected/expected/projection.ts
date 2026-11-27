;
function $$render() {
  
	let /** @typedef {{ children: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { children } = $props();
	let x = $state(1);

;

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
      x;
    }
    __rsvelte_ensure_snippet(children?.());
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const CssInjected__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof CssInjected__SvelteComponent_>} CssInjected__SvelteComponent_ */
export default CssInjected__SvelteComponent_;
