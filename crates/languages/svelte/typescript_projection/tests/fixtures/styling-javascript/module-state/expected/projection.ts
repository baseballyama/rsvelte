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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const ModuleState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ModuleState__SvelteComponent_>} ModuleState__SvelteComponent_ */
export default ModuleState__SvelteComponent_;
