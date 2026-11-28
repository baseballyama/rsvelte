;
function $$render() {
  let /** @typedef {{ value: any } & Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ {value,...rest}=$props()
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
      rest.other;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const OptionsCustomPropsRest__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof OptionsCustomPropsRest__SvelteComponent_>} OptionsCustomPropsRest__SvelteComponent_ */
export default OptionsCustomPropsRest__SvelteComponent_;
