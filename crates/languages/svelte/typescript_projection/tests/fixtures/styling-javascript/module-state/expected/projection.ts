;
let value=$state("a");export function set(next){value=next;}export function get(){return value;}
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": get(),
    });
  }
};
const ModuleState__SvelteComponent_ = __rsvelte_export_component();
export default ModuleState__SvelteComponent_;
