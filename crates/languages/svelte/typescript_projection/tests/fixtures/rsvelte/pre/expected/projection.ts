;
function $$render() {
  
	let text = $state('hi');

;

  async () => {
    {
      svelteHTML.createElement("pre", {});
      text;
    }
    {
      svelteHTML.createElement("pre", {});
    }
    {
      svelteHTML.createElement("pre", {});
      {
        svelteHTML.createElement("code", {});
        text;
      }
    }
    {
      svelteHTML.createElement("button", {
        "type": "button",
        "onclick": () => (text += '!'),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const Pre__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof Pre__SvelteComponent_>} Pre__SvelteComponent_ */
export default Pre__SvelteComponent_;
