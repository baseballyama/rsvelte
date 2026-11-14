;
import data from "./data.json" with {type:"json"};
;

async () => {
  {
    svelteHTML.createElement("p", {
      "class": data.value,
    });
  }
};
const ImportAttributes__SvelteComponent_ = __rsvelte_export_component();
export default ImportAttributes__SvelteComponent_;
