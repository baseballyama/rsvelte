;
function $$render() {
  
	/** @type {typeof __rsvelte_public_props0} */ let { p = 1 } = $props();
	let a = 1;
	let s = $state(0);
	let f = () => 1;
	class K {}
	let _class = '';
	

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    p: 1,
  }, false);
  async () => {
    {
      svelteHTML.createElement("div", {
        "class": _class,
        "onclick": f,
      });
      a;
      s;
      p;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {
    a: typeof a;
    s: typeof s;
    p: typeof p;
    f: typeof f;
    K: typeof K;
    class: typeof _class;
  }, "">} */ (__rsvelte_export_component))();
}
export const ExportSpecifiersUnwritten__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ExportSpecifiersUnwritten__SvelteComponent_>} ExportSpecifiersUnwritten__SvelteComponent_ */
export default ExportSpecifiersUnwritten__SvelteComponent_;
