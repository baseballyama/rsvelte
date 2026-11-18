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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const SnippetElementMemo__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SnippetElementMemo__SvelteComponent_>} */ (SnippetElementMemo__SvelteComponent_);
