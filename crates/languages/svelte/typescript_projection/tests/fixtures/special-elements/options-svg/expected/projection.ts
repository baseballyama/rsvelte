;
function $$render() {
  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "namespace": "svg",
      });
    }
    {
      svelteHTML.createElement("circle", {
        "cx": "10",
      });
    }
    {
      svelteHTML.createElement("circle", {});
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const OptionsSvg__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof OptionsSvg__SvelteComponent_>} OptionsSvg__SvelteComponent_ */
export default OptionsSvg__SvelteComponent_;
