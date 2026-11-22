;
function $$render() {
  let w = $state(0); let scroll = $state(0); let online = $state(true); let active = $state(null); let visibility = $state("visible"); let ratio = $state(1);
;

  async () => {
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
      w;
      scroll;
      online;
      active;
      visibility;
      ratio;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const GlobalsBindings__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof GlobalsBindings__SvelteComponent_>} GlobalsBindings__SvelteComponent_ */
export default GlobalsBindings__SvelteComponent_;
