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
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const ImportAttributes__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof ImportAttributes__SvelteComponent_>} ImportAttributes__SvelteComponent_ */
export default ImportAttributes__SvelteComponent_;
