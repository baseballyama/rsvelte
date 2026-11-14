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
const ModuleExport__SvelteComponent_ = __rsvelte_export_component();
export default ModuleExport__SvelteComponent_;
