;
function $$render() {
  
  const s = (q = 2n) => {
    async () => {
      q;
    };
    return __rsvelte_snippet_return;
  };

	let /** @typedef {{ p?: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { p = 1n } = $props();

;

  async () => {
    __rsvelte_ensure_snippet(s());
    p;
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const BigintFallbackIsSimple__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BigintFallbackIsSimple__SvelteComponent_>} BigintFallbackIsSimple__SvelteComponent_ */
export default BigintFallbackIsSimple__SvelteComponent_;
