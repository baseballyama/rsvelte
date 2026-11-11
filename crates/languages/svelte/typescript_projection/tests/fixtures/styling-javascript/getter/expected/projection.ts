;
let name="a";const obj={get name(){return name;},set name(value){name=value;}};
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": obj.name,
    });
  }
};
const Getter__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Getter__SvelteComponent_ = ReturnType<typeof Getter__SvelteComponent_>;
export default Getter__SvelteComponent_;
