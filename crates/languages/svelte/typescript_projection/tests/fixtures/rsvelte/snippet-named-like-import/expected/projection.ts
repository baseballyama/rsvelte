;

	const b = 1;

;


	import a from './a.js';
const a = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
  };
  return __rsvelte_snippet_return;
};
const b = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
  };
  return __rsvelte_snippet_return;
};
const c = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    __rsvelte_ensure_snippet(a());
  };
  return __rsvelte_snippet_return;
};


;

async () => {
  __rsvelte_ensure_snippet(a());
  __rsvelte_ensure_snippet(b());
  __rsvelte_ensure_snippet(c());
};
const SnippetNamedLikeImport__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetNamedLikeImport__SvelteComponent_ = ReturnType<typeof SnippetNamedLikeImport__SvelteComponent_>;
export default SnippetNamedLikeImport__SvelteComponent_;
