;
function $$render() {
  let /** @typedef {{ value?: boolean }} $$ComponentProps *//** @type {$$ComponentProps} */ {value=true}= $props();
;

  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      value;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomProps__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomProps__SvelteComponent_>} OptionsCustomProps__SvelteComponent_ */
export default OptionsCustomProps__SvelteComponent_;
