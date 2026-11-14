;

	let s = 'outer';

;

async () => {
  {
    for (let [, x] of __rsvelte_each([1])) {
      const s = () => {
        async () => {
          {
            svelteHTML.createElement("p", {});
            (x);
          }
        };
        return __rsvelte_snippet_return;
      };
      __rsvelte_ensure_snippet(s());
    }
  }
  {
    for (let [, y] of __rsvelte_each([2])) {
      {
        svelteHTML.createElement("p", {});
        (y);
      }
    }
  }
  (s);
};
const SnippetEachScope__SvelteComponent_ = __rsvelte_export_component();
export default SnippetEachScope__SvelteComponent_;
