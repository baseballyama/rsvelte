;
import C from './C.svelte';;

;

function $$render() {
  
	
  const s = () => {
    async () => {
      {
        svelteHTML.createElement("i", {});
        v;
      }
    };
    return __rsvelte_snippet_return;
  };

	let v = $state(1);
	let rest = {};

;

  async () => {
    {
      svelteHTML.createElement("p", {});
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
        "a": 1,
        "value": __rsvelte_get_set(() => v, (x) => (v = x)),
        ...(rest),
        "other": v,
        "b": 2,
      });
      () => {
        // @ts-ignore
        v = __rsvelte_untyped_prop();
      };
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "value";
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "other";
    }
    if (v) {
      {
        svelteHTML.createElement("span", {});
      }
      {
        const __rsvelte_component_0 = __rsvelte_component(C);
        const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
          children: __rsvelte_children,
          "open": __rsvelte_get_set(() => v, (x) => (v = x)),
        });
        __rsvelte_bindings(__rsvelte_component_0).$$bindings = "open";
        v;
        C;
      }
    }
    __rsvelte_ensure_snippet(s());
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindAccessors__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindAccessors__SvelteComponent_>} BindAccessors__SvelteComponent_ */
export default BindAccessors__SvelteComponent_;
