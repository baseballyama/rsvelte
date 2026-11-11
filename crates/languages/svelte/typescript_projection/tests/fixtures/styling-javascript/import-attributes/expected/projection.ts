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
const ImportAttributes__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type ImportAttributes__SvelteComponent_ = ReturnType<typeof ImportAttributes__SvelteComponent_>;
export default ImportAttributes__SvelteComponent_;
