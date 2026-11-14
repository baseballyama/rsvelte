;
import List from "./List.svelte"; /** @type {typeof __rsvelte_public_props0} */ let { children, item: outer } = $props();
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
    List;
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
    List;
  }
};
const SnippetComponentProps__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SnippetComponentProps__SvelteComponent_>} */ (SnippetComponentProps__SvelteComponent_);
