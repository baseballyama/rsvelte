;
function $$render() {
  
  const s = (p = obj!, q = n as number, r = <string>"x"): ReturnType<import('svelte').Snippet> => {
    async () => {
      p;
      q;
      r;
    };
    return __rsvelte_snippet_return;
  };

	let obj: any;
	let n = $state(1);

;

  async () => {
    __rsvelte_ensure_snippet(s());
  };
  return __rsvelte_export_component<__rsvelte_no_props, {}, "">();
}
const SnippetDefaultTypescriptErased__SvelteComponent_ = $$render();
type SnippetDefaultTypescriptErased__SvelteComponent_ = ReturnType<typeof SnippetDefaultTypescriptErased__SvelteComponent_>;
export default SnippetDefaultTypescriptErased__SvelteComponent_;
