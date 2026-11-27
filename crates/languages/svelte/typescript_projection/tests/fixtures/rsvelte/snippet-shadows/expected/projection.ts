;
import List from './List.svelte';;

;

function $$render() {
  
	
	let /** @typedef {{ item: any, label: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { item, label } = $props();
	let count = $state(0);
	let items = $state([1]);

;

  async () => {
    if (label) {
      {
        svelteHTML.createElement("div", {});
        const item = () => {
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
        const count = () => {
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
      count;
    }
    {
      for (let row of __rsvelte_each(items)) {
        {
          svelteHTML.createElement("div", {});
          const row = () => {
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
      const __rsvelte_element0 = new (__rsvelte_component_0)(__rsvelte_internals(), {
        props: {
          label: () => {
            async () => {
              __rsvelte_ensure_snippet(label?.());
            };
            return __rsvelte_snippet_return;
          },
        },
      });
      const { label } = __rsvelte_component_props(__rsvelte_component_0);
      List;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetShadows__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetShadows__SvelteComponent_>} SnippetShadows__SvelteComponent_ */
export default SnippetShadows__SvelteComponent_;
