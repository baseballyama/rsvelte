;
function $$render() {
  
  const t = (p, v = p(), w = f(), z = (() => 2)()) => {
    async () => {
      v;
      w;
      z;
    };
    return __rsvelte_snippet_return;
  };

	let /** @type {typeof __rsvelte_public_props0} */ { f } = $props();

;

  const __rsvelte_public_props0 = __rsvelte_props({
    f: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    __rsvelte_ensure_snippet(t(1));
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetParameterDefaultProps__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetParameterDefaultProps__SvelteComponent_>} SnippetParameterDefaultProps__SvelteComponent_ */
export default SnippetParameterDefaultProps__SvelteComponent_;
