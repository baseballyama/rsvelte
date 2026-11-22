;
import "./custom-button.js";;

;

function $$render() {
  
;

  async () => {
    {
      svelteHTML.createElement("svelte:options", {
        "customElement": "my-element",
      });
    }
    {
      svelteHTML.createElement("button", {
        "is": "custom-button",
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const OptionsCustomExtendedBuiltin__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof OptionsCustomExtendedBuiltin__SvelteComponent_>} OptionsCustomExtendedBuiltin__SvelteComponent_ */
export default OptionsCustomExtendedBuiltin__SvelteComponent_;
