;

	function g() {
		return 1;
	}

;

async () => {
  const t = (p, v = p(), w = g(), z = g(1)) => {
    async () => {
      (v);
      (w);
      (z);
    };
    return __rsvelte_snippet_return;
  };
  __rsvelte_ensure_snippet(t(() => 1));
};
const SnippetParameterDefaults__SvelteComponent_ = __rsvelte_export_component();
export default SnippetParameterDefaults__SvelteComponent_;
