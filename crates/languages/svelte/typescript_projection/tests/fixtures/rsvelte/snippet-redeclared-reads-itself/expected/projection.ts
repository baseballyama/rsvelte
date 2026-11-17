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

  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const SnippetRedeclaredReadsItself__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SnippetRedeclaredReadsItself__SvelteComponent_>} */ (SnippetRedeclaredReadsItself__SvelteComponent_);
