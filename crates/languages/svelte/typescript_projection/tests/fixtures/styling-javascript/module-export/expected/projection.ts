;
const value="a";export {value as name};export {other} from "./other.js";export * from "./x.js";
;

() => {
  {
    svelteHTML.createElement("p", {
      class: value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
