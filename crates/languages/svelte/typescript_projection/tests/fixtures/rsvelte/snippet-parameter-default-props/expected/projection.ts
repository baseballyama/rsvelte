;

const t = (p, v = p(), w = f(), z = (() => 2)()) => {
  async () => {
    (v);
    (w);
    (z);
  };
  return __rsvelte_snippet_return;
};

	/** @type {typeof __rsvelte_public_props0} */ let { f } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  f: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  __rsvelte_ensure_snippet(t(1));
};
const SnippetParameterDefaultProps__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SnippetParameterDefaultProps__SvelteComponent_>} */ (SnippetParameterDefaultProps__SvelteComponent_);
