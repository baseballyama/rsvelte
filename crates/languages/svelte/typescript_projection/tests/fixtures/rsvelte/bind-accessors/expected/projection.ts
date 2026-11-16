;
import C from './C.svelte';;

;

function $$render() {
  
	
  const s = () => {
    async () => {
      {
        svelteHTML.createElement("i", {});
        (v);
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
      __rsvelte_component_0(__rsvelte_internals(), {
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
        __rsvelte_component_0(__rsvelte_internals(), {
          children: __rsvelte_children,
          "open": __rsvelte_get_set(() => v, (x) => (v = x)),
        });
        __rsvelte_bindings(__rsvelte_component_0).$$bindings = "open";
        (v);
        C;
      }
    }
    __rsvelte_ensure_snippet(s());
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const BindAccessors__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof BindAccessors__SvelteComponent_>} */ (BindAccessors__SvelteComponent_);
