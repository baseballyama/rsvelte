;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": {shadow:"none",extend: Base => Base},
      });
    }
    {
      svelteHTML.createElement("p", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const OptionsCustomExtend__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof OptionsCustomExtend__SvelteComponent_>} OptionsCustomExtend__SvelteComponent_ */
export default OptionsCustomExtend__SvelteComponent_;
