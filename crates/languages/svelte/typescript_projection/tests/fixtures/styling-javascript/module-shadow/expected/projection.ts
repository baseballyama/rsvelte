;
const value="a";export function get(){return value;}
;

function $$render() {
  const value="b";
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const ModuleShadow__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ModuleShadow__SvelteComponent_>} ModuleShadow__SvelteComponent_ */
export default ModuleShadow__SvelteComponent_;
