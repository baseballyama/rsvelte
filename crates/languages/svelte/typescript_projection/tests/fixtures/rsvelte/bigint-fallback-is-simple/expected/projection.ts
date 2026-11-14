;

const s = (q = 2n) => {
  async () => {
    (q);
  };
  return __rsvelte_snippet_return;
};

	/** @type {typeof __rsvelte_public_props0} */ let { p = 1n } = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  p: __rsvelte_untyped_prop(),
}, false);
async () => {
  __rsvelte_ensure_snippet(s());
  (p);
};
const BigintFallbackIsSimple__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BigintFallbackIsSimple__SvelteComponent_>} */ (BigintFallbackIsSimple__SvelteComponent_);
