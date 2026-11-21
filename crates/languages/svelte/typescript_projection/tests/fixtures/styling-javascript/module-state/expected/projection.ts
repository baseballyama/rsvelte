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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const ModuleState__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof ModuleState__SvelteComponent_>} ModuleState__SvelteComponent_ */
export default ModuleState__SvelteComponent_;
