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
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SelectSelected__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SelectSelected__SvelteComponent_>} SelectSelected__SvelteComponent_ */
export default SelectSelected__SvelteComponent_;
