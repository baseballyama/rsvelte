;

	/** @type {typeof __rsvelte_public_props0} */ let { v } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  v: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  if (v) {
    const h = v;
    {
      svelteHTML.createElement("div", {});
      const s = () => {
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
        const t = () => {
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
const ConstRepeatedInASnippetBlock__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ConstRepeatedInASnippetBlock__SvelteComponent_>} */ (ConstRepeatedInASnippetBlock__SvelteComponent_);
