;
class Value{#value="a";get value(){return this.#value;}set value(next){this.#value=next;}}const value=new Value();
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": value.value,
    });
  }
};
const Class__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Class__SvelteComponent_ = ReturnType<typeof Class__SvelteComponent_>;
export default Class__SvelteComponent_;
