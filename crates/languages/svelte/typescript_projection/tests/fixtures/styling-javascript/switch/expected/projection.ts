;
function $$render() {
  const value="a";function run(x){switch(x){case 1:return "a";case 2:throw new Error("b");default:return "b";}}
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": run(1),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Switch__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Switch__SvelteComponent_>} Switch__SvelteComponent_ */
export default Switch__SvelteComponent_;
