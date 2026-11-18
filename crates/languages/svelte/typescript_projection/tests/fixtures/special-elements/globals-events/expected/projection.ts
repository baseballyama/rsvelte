;
function $$render() {
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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, string>} */ (__rsvelte_export_component))();
}
const GlobalsEvents__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof GlobalsEvents__SvelteComponent_>} */ (GlobalsEvents__SvelteComponent_);
