;
class Value{#value="a";get value(){return this.#value;}set value(next){this.#value=next;}}const value=new Value();
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value.value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
