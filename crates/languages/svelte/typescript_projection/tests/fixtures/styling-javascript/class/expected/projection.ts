;
class Value{#value="a";get value(){return this.#value;}set value(next){this.#value=next;}}const value=new Value();
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value.value,
    });
  }
};
const Class__SvelteComponent_ = __rsvelte_export_component();
export default Class__SvelteComponent_;
