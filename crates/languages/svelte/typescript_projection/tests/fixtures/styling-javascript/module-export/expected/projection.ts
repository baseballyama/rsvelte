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
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const ModuleExport__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ModuleExport__SvelteComponent_>} */ (ModuleExport__SvelteComponent_);
