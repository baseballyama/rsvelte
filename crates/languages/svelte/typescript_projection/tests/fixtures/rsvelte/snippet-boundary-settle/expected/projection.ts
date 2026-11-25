;
import Input from './Input.svelte';;

;

function $$render() {
  
	
  const row = () => {
    async () => {
      {
        svelteHTML.createElement("p", {});
        value;
      }
    };
    return __rsvelte_snippet_return;
  };

	let value = $state('');

;

  async () => {
    {
      const __rsvelte_component_0 = __rsvelte_component(Input);
      const __rsvelte_element0 = __rsvelte_bind_this(__rsvelte_component_0)(__rsvelte_internals(), {
        value,
      });
      () => {
        // @ts-ignore
        value = __rsvelte_untyped_prop();
      };
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "value";
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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetBoundarySettle__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetBoundarySettle__SvelteComponent_>} SnippetBoundarySettle__SvelteComponent_ */
export default SnippetBoundarySettle__SvelteComponent_;
