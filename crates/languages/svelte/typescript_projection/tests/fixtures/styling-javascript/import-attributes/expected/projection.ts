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
const ImportAttributes__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof ImportAttributes__SvelteComponent_>} */ (ImportAttributes__SvelteComponent_);
