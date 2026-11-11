;
let win = $state(); let n = $state(0);
;

() => {
  {
    win = svelteHTML.createElement("svelte:window", {
      "onclick": () => n++,
    });
  }
  {
    svelteHTML.createElement("p", {});
    (n);
  }
};
const GlobalsBindThisMixed__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalsBindThisMixed__SvelteComponent_ = ReturnType<typeof GlobalsBindThisMixed__SvelteComponent_>;
export default GlobalsBindThisMixed__SvelteComponent_;
