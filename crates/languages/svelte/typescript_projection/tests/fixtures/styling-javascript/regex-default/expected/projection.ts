;
function $$render() {
  const f=(pattern=/[(){}]/) => pattern.test("a");
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": f() ? "a" : "b",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const RegexDefault__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof RegexDefault__SvelteComponent_>} RegexDefault__SvelteComponent_ */
export default RegexDefault__SvelteComponent_;
