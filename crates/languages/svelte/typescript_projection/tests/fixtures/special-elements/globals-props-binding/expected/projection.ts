;
let { width = $bindable(), x = $bindable() }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  width: __rsvelte_untyped_prop(),
  x: __rsvelte_untyped_prop(),
}, false);
() => {
  {
    svelteHTML.createElement("svelte:window", {
      "bind:innerWidth": width,
      "bind:scrollX": x,
    });
    () => {
      // @ts-ignore
      width = __rsvelte_untyped_prop();
    };
    () => {
      // @ts-ignore
      x = __rsvelte_untyped_prop();
    };
  }
};
const GlobalsPropsBinding__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "width" | "x">();
type GlobalsPropsBinding__SvelteComponent_ = ReturnType<typeof GlobalsPropsBinding__SvelteComponent_>;
export default GlobalsPropsBinding__SvelteComponent_;
