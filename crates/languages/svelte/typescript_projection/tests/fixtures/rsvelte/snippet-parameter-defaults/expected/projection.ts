;

	function g() {
		return 1;
	}

;

() => {
  const t = (p, v = p(), w = g(), z = g(1)): ReturnType<import('svelte').Snippet> => {
    async () => {
      (v);
      (w);
      (z);
    };
    return __rsvelte_snippet_return;
  };
  __rsvelte_ensure_snippet(t(() => 1));
};
const SnippetParameterDefaults__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetParameterDefaults__SvelteComponent_ = ReturnType<typeof SnippetParameterDefaults__SvelteComponent_>;
export default SnippetParameterDefaults__SvelteComponent_;
