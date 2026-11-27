;
function $$render() {
  let /** @typedef {{ value: any }} $$ComponentProps *//** @type {$$ComponentProps} */ {value: local}= $props();
;

  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("p", {});
      local;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomPropsAlias__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomPropsAlias__SvelteComponent_>} OptionsCustomPropsAlias__SvelteComponent_ */
export default OptionsCustomPropsAlias__SvelteComponent_;
