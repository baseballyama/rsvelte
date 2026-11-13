;

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
      (name);
    }
  };
  return __rsvelte_snippet_return;
};
const typed = (item: Item): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("p", {});
      (item.label);
    }
  };
  return __rsvelte_snippet_return;
};

	type Item = { label: string };
	type __rsvelte_props_type0 = { name: string };
let { name }: __rsvelte_props_type0 = $props();

;

async () => {
  __rsvelte_ensure_snippet(reaches());
  __rsvelte_ensure_snippet(typed({ label: 'a' }));
};
const SnippetHoisting__SvelteComponent_ = __rsvelte_export_component<__rsvelte_props_type0, {}, "">();
type SnippetHoisting__SvelteComponent_ = ReturnType<typeof SnippetHoisting__SvelteComponent_>;
export default SnippetHoisting__SvelteComponent_;
