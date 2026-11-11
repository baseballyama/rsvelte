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
const ModuleExport__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ModuleExport__SvelteComponent_ = ReturnType<typeof ModuleExport__SvelteComponent_>;
export default ModuleExport__SvelteComponent_;
