;
let win = $state(); let doc = $state(); let body = $state();
;

async () => {
  {
    win = svelteHTML.createElement("svelte:window", {});
  }
  {
    doc = svelteHTML.createElement("svelte:document", {});
  }
  {
    body = svelteHTML.createElement("svelte:body", {});
  }
};
const GlobalsBindThis__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalsBindThis__SvelteComponent_ = ReturnType<typeof GlobalsBindThis__SvelteComponent_>;
export default GlobalsBindThis__SvelteComponent_;
