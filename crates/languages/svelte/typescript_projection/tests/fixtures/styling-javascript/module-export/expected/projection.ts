;
const value="a";export {value as name};export {other} from "./other.js";export * from "./x.js";
;

function $$render() {
  async () => {
    {
      svelteHTML.createElement("p", {
        "class": value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const ModuleExport__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ModuleExport__SvelteComponent_>} ModuleExport__SvelteComponent_ */
export default ModuleExport__SvelteComponent_;
