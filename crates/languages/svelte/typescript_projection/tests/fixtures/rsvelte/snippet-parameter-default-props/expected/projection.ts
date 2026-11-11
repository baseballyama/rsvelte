;

const t = (p, v = p(), w = f(), z = (() => 2)()): ReturnType<import('svelte').Snippet> => {
  async () => {
    (v);
    (w);
    (z);
  };
  return __rsvelte_snippet_return;
};

	let { f }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({
  f: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  __rsvelte_ensure_snippet(t(1));
};
const SnippetParameterDefaultProps__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SnippetParameterDefaultProps__SvelteComponent_ = ReturnType<typeof SnippetParameterDefaultProps__SvelteComponent_>;
export default SnippetParameterDefaultProps__SvelteComponent_;
