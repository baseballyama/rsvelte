;
let value=$state("a");export function set(next){value=next;}export function get(){return value;}
;

() => {
  {
    svelteHTML.createElement("p", {
      "class": get(),
    });
  }
};
const ModuleState__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ModuleState__SvelteComponent_ = ReturnType<typeof ModuleState__SvelteComponent_>;
export default ModuleState__SvelteComponent_;
