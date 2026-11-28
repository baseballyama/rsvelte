;
import List from "./List.svelte";;

;

function $$render() {
   let /** @typedef {{ children: any, item: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { children, item: outer } = $props();
;

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
      {
        svelteHTML.createElement("p", {});
      }
      List;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetComponentProps__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetComponentProps__SvelteComponent_>} SnippetComponentProps__SvelteComponent_ */
export default SnippetComponentProps__SvelteComponent_;
