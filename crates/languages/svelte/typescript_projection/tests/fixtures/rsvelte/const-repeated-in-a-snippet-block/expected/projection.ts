;
function $$render() {
  
	let /** @typedef {{ v: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { v } = $props();

;

  async () => {
    if (v) {
      const h = v;
      {
        svelteHTML.createElement("div", {});
        const s = () => {
          async () => {
            h;
          };
          return __rsvelte_snippet_return;
        };
        __rsvelte_ensure_snippet(s());
      }
    }
    if (v) {
      const k = v;
      {
        svelteHTML.createElement("section", {});
        {
          svelteHTML.createElement("p", {});
          const t = () => {
            async () => {
              k;
            };
            return __rsvelte_snippet_return;
          };
          __rsvelte_ensure_snippet(t());
        }
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const ConstRepeatedInASnippetBlock__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ConstRepeatedInASnippetBlock__SvelteComponent_>} ConstRepeatedInASnippetBlock__SvelteComponent_ */
export default ConstRepeatedInASnippetBlock__SvelteComponent_;
