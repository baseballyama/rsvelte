;
export const value = 1;
;


const same = () => {
  async () => {
    __rsvelte_ensure_snippet(same());
  };
  return __rsvelte_snippet_return;
};

;

function $$render() {
  
  const same = () => {
    async () => {
      local;
    };
    return __rsvelte_snippet_return;
  };
let local = 1;
;

  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const SnippetRedeclaredReadsItself__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SnippetRedeclaredReadsItself__SvelteComponent_>} SnippetRedeclaredReadsItself__SvelteComponent_ */
export default SnippetRedeclaredReadsItself__SvelteComponent_;
