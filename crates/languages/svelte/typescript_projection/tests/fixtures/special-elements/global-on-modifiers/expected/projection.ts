;
async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "on:click": ()=>{},
    });
  }
  {
    svelteHTML.createElement("svelte:document", {
      "on:touchmove": ()=>{},
    });
  }
  {
    svelteHTML.createElement("svelte:body", {
      "on:keydown": ()=>{},
    });
  }
};
const GlobalOnModifiers__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalOnModifiers__SvelteComponent_ = ReturnType<typeof GlobalOnModifiers__SvelteComponent_>;
export default GlobalOnModifiers__SvelteComponent_;
