;

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
const SnippetElementMemo__SvelteComponent_ = __rsvelte_export_component();
export default SnippetElementMemo__SvelteComponent_;
