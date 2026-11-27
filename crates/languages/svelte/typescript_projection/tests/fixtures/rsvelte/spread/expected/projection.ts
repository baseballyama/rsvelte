;
function $$render() {
  
	let /** @typedef {{ children: any } & Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ { children, ...rest } = $props();

;

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
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const Spread__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Spread__SvelteComponent_>} Spread__SvelteComponent_ */
export default Spread__SvelteComponent_;
