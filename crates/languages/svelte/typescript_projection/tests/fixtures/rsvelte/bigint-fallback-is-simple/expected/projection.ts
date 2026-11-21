;
function $$render() {
  
  const s = (q = 2n) => {
    async () => {
      q;
    };
    return __rsvelte_snippet_return;
  };

	let /** @type {typeof __rsvelte_public_props0} */ { p = 1n } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({}, {
    p: __rsvelte_untyped_prop(),
  }, false);
  async () => {
    __rsvelte_ensure_snippet(s());
    p;
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
const BigintFallbackIsSimple__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BigintFallbackIsSimple__SvelteComponent_>} */ (BigintFallbackIsSimple__SvelteComponent_);
