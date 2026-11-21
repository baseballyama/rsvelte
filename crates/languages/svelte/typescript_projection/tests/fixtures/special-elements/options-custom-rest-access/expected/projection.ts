;
function $$render() {
  
let /** @type {typeof __rsvelte_public_props0} */ {value,...rest}=$props();
function change() { rest.other=1; rest.count++; let x; x=rest.other; return rest.other; }

;

  const __rsvelte_public_props0 = __rsvelte_props({
    value: __rsvelte_untyped_prop(),
  }, {}, true);
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      rest.other;
      rest.value;
      rest['other'];
    }
  };
  return (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomRestAccess__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomRestAccess__SvelteComponent_>} OptionsCustomRestAccess__SvelteComponent_ */
export default OptionsCustomRestAccess__SvelteComponent_;
