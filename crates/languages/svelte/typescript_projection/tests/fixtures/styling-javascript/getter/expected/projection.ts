;
function $$render() {
  let name="a";const obj={get name(){return name;},set name(value){name=value;}};
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": obj.name,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Getter__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Getter__SvelteComponent_>} Getter__SvelteComponent_ */
export default Getter__SvelteComponent_;
