;
function handler(event) { console.log(event.type); }
;

async () => {
  {
    svelteHTML.createElement("svelte:window", {
      "onclick": handler,
      "onresize": handler,
    });
  }
  {
    svelteHTML.createElement("svelte:document", {
      "onkeydown": handler,
    });
  }
  {
    svelteHTML.createElement("svelte:body", {
      "ontouchstart": handler,
    });
  }
  {
    svelteHTML.createElement("p", {});
  }
};
const GlobalsEvents__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type GlobalsEvents__SvelteComponent_ = ReturnType<typeof GlobalsEvents__SvelteComponent_>;
export default GlobalsEvents__SvelteComponent_;
