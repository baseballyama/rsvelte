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
const GlobalOnModifiers__SvelteComponent_ = __rsvelte_export_component();
export default GlobalOnModifiers__SvelteComponent_;
