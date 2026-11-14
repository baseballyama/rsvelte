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
const Getter__SvelteComponent_ = __rsvelte_export_component();
export default Getter__SvelteComponent_;
