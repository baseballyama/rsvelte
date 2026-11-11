;

	let o = $state({ t: 'A' });
	const f = (x) => x;

;

() => {
  {
    svelteHTML.createElement("span", {
      "class": `b ${o.t.toLowerCase()}`,
    });
  }
  {
    svelteHTML.createElement("div", {});
    const s = (): ReturnType<import('svelte').Snippet> => {
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
const SnippetElementMemo__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetElementMemo__SvelteComponent_ = ReturnType<typeof SnippetElementMemo__SvelteComponent_>;
export default SnippetElementMemo__SvelteComponent_;
