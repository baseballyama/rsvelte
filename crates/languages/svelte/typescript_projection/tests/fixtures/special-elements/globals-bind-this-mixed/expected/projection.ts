;
let win = $state(); let n = $state(0);
;

async () => {
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
const GlobalsBindThisMixed__SvelteComponent_ = __rsvelte_export_component();
export default GlobalsBindThisMixed__SvelteComponent_;
