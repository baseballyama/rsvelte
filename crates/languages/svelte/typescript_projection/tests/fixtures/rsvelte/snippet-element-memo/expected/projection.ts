;
function $$render() {
  
	let o = $state({ t: 'A' });
	const f = (x) => x;

;

  async () => {
    {
      svelteHTML.createElement("span", {
        "class": `b ${o.t.toLowerCase()}`,
      });
    }
    {
      svelteHTML.createElement("div", {});
      const s = () => {
        async () => {
        };
        return __rsvelte_snippet_return;
      };
      {
        svelteHTML.createElement("button", {
          "class": f(o.t) ? 'c' : '',
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetElementMemo__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetElementMemo__SvelteComponent_>} SnippetElementMemo__SvelteComponent_ */
export default SnippetElementMemo__SvelteComponent_;
