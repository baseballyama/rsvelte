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
const BindDerived__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type BindDerived__SvelteComponent_ = ReturnType<typeof BindDerived__SvelteComponent_>;
export default BindDerived__SvelteComponent_;
