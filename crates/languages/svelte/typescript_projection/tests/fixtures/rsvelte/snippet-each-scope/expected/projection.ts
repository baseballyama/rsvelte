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
const SnippetEachScope__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SnippetEachScope__SvelteComponent_>} */ (SnippetEachScope__SvelteComponent_);
