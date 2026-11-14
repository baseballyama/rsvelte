;

	import C from './C.svelte';
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
    __rsvelte_component(C)(__rsvelte_internals(), {
      "value": e,
    });
    () => {
      // @ts-ignore
      e = __rsvelte_untyped_prop();
    };
  }
  {
    d = svelteHTML.createElement("div", {});
  }
};
const BindDerived__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof BindDerived__SvelteComponent_>} */ (BindDerived__SvelteComponent_);
