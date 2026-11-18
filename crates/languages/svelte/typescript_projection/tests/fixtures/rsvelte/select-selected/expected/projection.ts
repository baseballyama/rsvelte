;
import { vmodel, vModelSelect, looseEqual } from './runtime.js';;

;

function $$render() {
  
	

	let model = $state('b');

;

  async () => {
    {
      svelteHTML.createElement("select", {
        [Symbol("@attach")]: vmodel(vModelSelect, () => model, {}, { 'onUpdate:modelValue': (v) => (model = v) }),
      });
      {
        svelteHTML.createElement("option", {
          "value": "a",
          "selected": looseEqual(model, 'a') ? '' : undefined,
        });
      }
      {
        svelteHTML.createElement("option", {
          "value": "b",
          "selected": looseEqual(model, 'b') ? '' : undefined,
        });
      }
      {
        svelteHTML.createElement("option", {
          "disabled": model === 'a' ? '' : undefined,
        });
      }
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const SelectSelected__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SelectSelected__SvelteComponent_>} */ (SelectSelected__SvelteComponent_);
