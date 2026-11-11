;

	let s = 'outer';

;

() => {
  {
    for (let [, x] of __rsvelte_each([1])) {
      const s = (): ReturnType<import('svelte').Snippet> => {
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
const SnippetEachScope__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetEachScope__SvelteComponent_ = ReturnType<typeof SnippetEachScope__SvelteComponent_>;
export default SnippetEachScope__SvelteComponent_;
