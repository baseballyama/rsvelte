;
function $$render() {
  const pattern=/[(){}\/]+/giu;
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": pattern.test("a") ? "a" : "b",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const Regex__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Regex__SvelteComponent_>} Regex__SvelteComponent_ */
export default Regex__SvelteComponent_;
