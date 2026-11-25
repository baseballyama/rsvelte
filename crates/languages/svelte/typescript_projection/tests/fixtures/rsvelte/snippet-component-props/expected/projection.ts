;
import List from "./List.svelte";;

;

function $$render() {
   let /** @type {typeof __rsvelte_public_props0} */ { children, item: outer } = $props();
;

  const __rsvelte_public_props0 = __rsvelte_props({
    children: __rsvelte_untyped_prop(),
    item: __rsvelte_untyped_prop(),
  }, {}, false);
  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(List);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
        item: (value) => {
          async () => {
            {
              svelteHTML.createElement("span", {});
              value;
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
      item;
      children;
      List;
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(List);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
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
      header;
      {
        svelteHTML.createElement("p", {});
      }
      List;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetComponentProps__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetComponentProps__SvelteComponent_>} SnippetComponentProps__SvelteComponent_ */
export default SnippetComponentProps__SvelteComponent_;
