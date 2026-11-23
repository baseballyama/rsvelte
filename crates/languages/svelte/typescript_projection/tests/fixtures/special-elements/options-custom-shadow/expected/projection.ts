;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": {tag:"my-element",shadow:"none"},
      });
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const OptionsCustomShadow__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof OptionsCustomShadow__SvelteComponent_>} OptionsCustomShadow__SvelteComponent_ */
export default OptionsCustomShadow__SvelteComponent_;
