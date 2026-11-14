;
const value="a";export {value as name};export {other} from "./other.js";export * from "./x.js";
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": value,
    });
  }
};
const ModuleExport__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ModuleExport__SvelteComponent_>} */ (ModuleExport__SvelteComponent_);
