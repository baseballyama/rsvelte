;

	import Input from './Input.svelte';
const row = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("p", {});
      (value);
    }
  };
  return __rsvelte_snippet_return;
};

	let value = $state('');

;

async () => {
  {
    __rsvelte_component(Input)(__rsvelte_internals(), {
      value,
    });
    () => {
      // @ts-ignore
      value = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("svelte:boundary", {
      failed: () => {
        async () => {
          {
            svelteHTML.createElement("p", {});
          }
        };
        return __rsvelte_snippet_return;
      },
      other: () => {
        async () => {
          {
            svelteHTML.createElement("p", {});
          }
        };
        return __rsvelte_snippet_return;
      },
    });
    __rsvelte_ensure_snippet(other());
    __rsvelte_ensure_snippet(row());
  }
};
const SnippetBoundarySettle__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type SnippetBoundarySettle__SvelteComponent_ = ReturnType<typeof SnippetBoundarySettle__SvelteComponent_>;
export default SnippetBoundarySettle__SvelteComponent_;
