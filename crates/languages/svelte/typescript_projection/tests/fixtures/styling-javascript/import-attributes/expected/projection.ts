;
import data from "./data.json" with {type:"json"};;

;

function $$render() {
  
;

  async () => {
    {
      svelteHTML.createElement("p", {
        "class": data.value,
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const ImportAttributes__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof ImportAttributes__SvelteComponent_>} */ (ImportAttributes__SvelteComponent_);
