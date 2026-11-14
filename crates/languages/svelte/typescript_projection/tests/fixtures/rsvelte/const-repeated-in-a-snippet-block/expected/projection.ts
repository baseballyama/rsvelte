;

	let { v }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  v: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  if (v) {
    const h = v;
    {
      svelteHTML.createElement("div", {});
      const s = (): ReturnType<import('svelte').Snippet> => {
        async () => {
          (h);
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
        const t = (): ReturnType<import('svelte').Snippet> => {
          async () => {
            (k);
          };
          return __rsvelte_snippet_return;
        };
        __rsvelte_ensure_snippet(t());
      }
    }
  }
};
const ConstRepeatedInASnippetBlock__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type ConstRepeatedInASnippetBlock__SvelteComponent_ = ReturnType<typeof ConstRepeatedInASnippetBlock__SvelteComponent_>;
export default ConstRepeatedInASnippetBlock__SvelteComponent_;
