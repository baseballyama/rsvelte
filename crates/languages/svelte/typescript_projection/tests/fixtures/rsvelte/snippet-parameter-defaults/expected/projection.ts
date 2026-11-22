;

	function g() {
		return 1;
	}

;

function $$render() {
  async () => {
    const t = (p, v = p(), w = g(), z = g(1)) => {
      async () => {
        v;
        w;
        z;
      };
      return __rsvelte_snippet_return;
    };
    __rsvelte_ensure_snippet(t(() => 1));
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const SnippetParameterDefaults__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SnippetParameterDefaults__SvelteComponent_>} SnippetParameterDefaults__SvelteComponent_ */
export default SnippetParameterDefaults__SvelteComponent_;
