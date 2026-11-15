;
let value=$state("a");export function set(next){value=next;}export function get(){return value;}
;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {
        "class": get(),
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const ModuleState__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ModuleState__SvelteComponent_>} */ (ModuleState__SvelteComponent_);
