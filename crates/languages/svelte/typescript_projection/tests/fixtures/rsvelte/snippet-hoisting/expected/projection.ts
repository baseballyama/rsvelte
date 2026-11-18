;
type Item = { label: string };;
type $$ComponentProps = { name: string };

;

function $$render() {
  
  const reaches = (): ReturnType<import('svelte').Snippet> => {
    async () => {
      __rsvelte_ensure_snippet(blocked());
    };
    return __rsvelte_snippet_return;
  };
  const blocked = (): ReturnType<import('svelte').Snippet> => {
    async () => {
      {
        svelteHTML.createElement("p", {});
        name;
      }
    };
    return __rsvelte_snippet_return;
  };
  const typed = (item: Item): ReturnType<import('svelte').Snippet> => {
    async () => {
      {
        svelteHTML.createElement("p", {});
        item.label;
      }
    };
    return __rsvelte_snippet_return;
  };

	
	let { name }: $$ComponentProps = $props();

;

  async () => {
    __rsvelte_ensure_snippet(reaches());
    __rsvelte_ensure_snippet(typed({ label: 'a' }));
  };
  return __rsvelte_export_component<$$ComponentProps, {}, "">();
}
const SnippetHoisting__SvelteComponent_ = $$render();
type SnippetHoisting__SvelteComponent_ = ReturnType<typeof SnippetHoisting__SvelteComponent_>;
export default SnippetHoisting__SvelteComponent_;
