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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const Class__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof Class__SvelteComponent_>} */ (Class__SvelteComponent_);
