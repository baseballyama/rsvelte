;

const s = (q = 2n): ReturnType<import('svelte').Snippet> => {
  async () => {
    (q);
  };
  return __rsvelte_snippet_return;
};

	let { p = 1n }: typeof __rsvelte_public_props0 = $props();

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  p: __rsvelte_untyped_prop(),
}, false);
async () => {
  __rsvelte_ensure_snippet(s());
  (p);
};
const BigintFallbackIsSimple__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type BigintFallbackIsSimple__SvelteComponent_ = ReturnType<typeof BigintFallbackIsSimple__SvelteComponent_>;
export default BigintFallbackIsSimple__SvelteComponent_;
