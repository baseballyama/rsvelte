;
let w = $state(0); let scroll = $state(0); let online = $state(true); let active = $state(null); let visibility = $state("visible"); let ratio = $state(1);
;

() => {
  {
    svelteHTML.createElement("svelte:window", {
      "bind:innerWidth": w,
      "bind:scrollY": scroll,
      "bind:online": online,
      "bind:devicePixelRatio": ratio,
    });
    () => {
      // @ts-ignore
      w = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      scroll = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      online = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      ratio = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("svelte:document", {
      "bind:activeElement": active,
      "bind:visibilityState": visibility,
    });
    () => {
      // @ts-ignore
      active = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      visibility = __rsvelte_untyped_prop();
    };
  }
  {
    svelteHTML.createElement("p", {});
    (w);
    (scroll);
    (online);
    (active);
    (visibility);
    (ratio);
  }
};
const GlobalsBindings__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalsBindings__SvelteComponent_ = ReturnType<typeof GlobalsBindings__SvelteComponent_>;
export default GlobalsBindings__SvelteComponent_;
