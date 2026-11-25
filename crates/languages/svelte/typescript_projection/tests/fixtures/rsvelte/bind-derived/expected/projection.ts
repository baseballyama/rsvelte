;
import C from './C.svelte';;

;

function $$render() {
  
	
	let n = $state(1);
	let d = $derived(n * 2);
	let e = $derived.by(() => n);
	let o = $derived({ a: n });

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "bind:value": d,
      });
      () => {
        // @ts-ignore
        d = __rsvelte_untyped_prop();
      };
    }
    {
      svelteHTML.createElement("input", {
        "bind:value": o.a,
      });
      () => {
        // @ts-ignore
        o.a = __rsvelte_untyped_prop();
      };
    }
    {
      const __rsvelte_component_0 = __rsvelte_component(C);
      const __rsvelte_element0 = __rsvelte_component_0(__rsvelte_internals(), {
        "value": e,
      });
      () => {
        // @ts-ignore
        e = __rsvelte_untyped_prop();
      };
      __rsvelte_bindings(__rsvelte_component_0).$$bindings = "value";
    }
    {
      d = svelteHTML.createElement("div", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const BindDerived__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof BindDerived__SvelteComponent_>} BindDerived__SvelteComponent_ */
export default BindDerived__SvelteComponent_;
