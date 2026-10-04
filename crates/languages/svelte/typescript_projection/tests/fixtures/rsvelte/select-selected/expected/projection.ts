;

	import { vmodel, vModelSelect, looseEqual } from './runtime.js';

	let model = $state('b');

;

{
  svelteHTML.createElement("select", {
    [Symbol("@attach")]: vmodel(vModelSelect, () => model, {}, { 'onUpdate:modelValue': (v) => (model = v) }),
  });
  {
    svelteHTML.createElement("option", {
      value: "a",
      selected: looseEqual(model, 'a') ? '' : undefined,
    });
  }
  {
    svelteHTML.createElement("option", {
      value: "b",
      selected: looseEqual(model, 'b') ? '' : undefined,
    });
  }
  {
    svelteHTML.createElement("option", {
      disabled: model === 'a' ? '' : undefined,
    });
  }
}
export default __rsvelte_export_component<Record<string, never>, {}, "">();
