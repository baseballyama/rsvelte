;
import List from "./List.svelte"; let { children, item: outer }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  children: __rsvelte_untyped_prop(),
  item: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  {
    const __rsvelte_component_0 = __rsvelte_component(List);
    __rsvelte_component_0(__rsvelte_internals(), {
      item: (value) => {
        async () => {
          {
            svelteHTML.createElement("span", {});
            (value);
          }
        };
        return __rsvelte_snippet_return;
      },
      children: (value) => {
        async () => {
          __rsvelte_ensure_snippet(children?.(value));
        };
        return __rsvelte_snippet_return;
      },
    });
    const { item, children } = __rsvelte_component_props(__rsvelte_component_0);
  }
  {
    const __rsvelte_component_0 = __rsvelte_component(List);
    __rsvelte_component_0(__rsvelte_internals(), {
      children: __rsvelte_children,
      header: () => {
        async () => {
          {
            svelteHTML.createElement("h1", {});
          }
        };
        return __rsvelte_snippet_return;
      },
    });
    const { header } = __rsvelte_component_props(__rsvelte_component_0);
    {
      svelteHTML.createElement("p", {});
    }
  }
};
const SnippetComponentProps__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SnippetComponentProps__SvelteComponent_ = ReturnType<typeof SnippetComponentProps__SvelteComponent_>;
export default SnippetComponentProps__SvelteComponent_;
