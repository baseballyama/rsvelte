;
function $$render() {
  
	let text = $state('');
	let focused = $state(false);

	function autofocus(node) {
		node.focus();
	}

;

  async () => {
    {
      svelteHTML.createElement("label", {});
      {
        svelteHTML.createElement("input", {
          "bind:value": text,
          [Symbol("@attach")]: autofocus,
        });
        () => {
          // @ts-ignore
          text = __rsvelte_untyped_prop();
        };
      }
    }
    {
      svelteHTML.createElement("p", {
        [Symbol("@attach")]: () => {
	focused = text.length > 0;
},
      });
      focused ? 'typing' : 'idle';
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const AttachInput__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof AttachInput__SvelteComponent_>} AttachInput__SvelteComponent_ */
export default AttachInput__SvelteComponent_;
