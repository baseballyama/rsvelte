;
import data from "./data.json" with {type:"json"};
;

() => {
  {
    svelteHTML.createElement("p", {
      class: data.value,
    });
  }
};
export default __rsvelte_export_component<Record<string, never>, {}, "">();
