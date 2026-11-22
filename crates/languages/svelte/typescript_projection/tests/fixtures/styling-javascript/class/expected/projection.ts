;
function $$render() {
  class Value{#value="a";get value(){return this.#value;}set value(next){this.#value=next;}}const value=new Value();
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value.value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const Class__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof Class__SvelteComponent_>} Class__SvelteComponent_ */
export default Class__SvelteComponent_;
