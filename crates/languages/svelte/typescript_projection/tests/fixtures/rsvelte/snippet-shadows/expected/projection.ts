;

	import List from './List.svelte';
	let { item, label }: typeof __rsvelte_public_props0 = $props();
	let count = $state(0);
	let items = $state([1]);

;

const __rsvelte_public_props0 = __rsvelte_props({
  item: __rsvelte_untyped_prop(),
  label: __rsvelte_untyped_prop(),
}, {}, false);
() => {
  if (label) {
    {
      svelteHTML.createElement("div", {});
      const item = (): ReturnType<import('svelte').Snippet> => {
        async () => {
          {
            svelteHTML.createElement("b", {});
          }
        };
        return __rsvelte_snippet_return;
      };
      __rsvelte_ensure_snippet(item());
    }
    {
      svelteHTML.createElement("p", {});
      const count = (): ReturnType<import('svelte').Snippet> => {
        async () => {
        };
        return __rsvelte_snippet_return;
      };
      __rsvelte_ensure_snippet(count());
    }
  }
  {
    svelteHTML.createElement("button", {
      "onclick": () => count++,
    });
    (count);
  }
  {
    for (let [, row] of __rsvelte_each(items)) {
      {
        svelteHTML.createElement("div", {});
        const row = (): ReturnType<import('svelte').Snippet> => {
          async () => {
          };
          return __rsvelte_snippet_return;
        };
        if (label) {
          __rsvelte_ensure_snippet(row());
        }
        {
          svelteHTML.createElement("i", {
            "title": String(row),
          });
        }
      }
    }
  }
  {
    const __rsvelte_component_0 = __rsvelte_component(List);
    __rsvelte_component_0(__rsvelte_internals(), {
      label: () => {
        __rsvelte_ensure_snippet(label?.());
        return __rsvelte_snippet_return;
      },
    });
    const { label } = __rsvelte_component_props(__rsvelte_component_0);
  }
};
const SnippetShadows__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SnippetShadows__SvelteComponent_ = ReturnType<typeof SnippetShadows__SvelteComponent_>;
export default SnippetShadows__SvelteComponent_;
