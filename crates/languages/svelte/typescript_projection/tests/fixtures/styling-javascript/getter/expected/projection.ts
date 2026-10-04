;
let name="a";const obj={get name(){return name;},set name(value){name=value;}};
;

() => {
  {
    svelteHTML.createElement("p", {
      class: obj.name,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
