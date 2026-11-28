;
import { vmodel, vModelText } from './runtime.js';;

;

function $$render() {
  
	

	let /** @typedef {{ own?: string } & Record<string, any>} $$ComponentProps *//** @type {$$ComponentProps} */ { own = 'a', ...rest } = $props();
	let text = $state('');
	let attrs = $derived.by(() => ({ ...rest, title: text }));

	function onClick() {
		text = '';
	}

;

  async () => {
    {
      svelteHTML.createElement("input", {
        "type": "text",
        "onclick": onClick,
        ...(attrs),
        "class": 'class' in attrs ? [own, attrs.class] : own,
      });
    }
    {
      svelteHTML.createElement("input", {
        "type": "text",
        [Symbol("@attach")]: vmodel(vModelText, () => text, {}, { 'onUpdate:modelValue': (v) => (text = v) }),
      });
    }
    {
      svelteHTML.createElement("div", {
        "onclick": () => (text = 'x'),
        ...(attrs),
      });
      text;
    }
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SpreadClassLast__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SpreadClassLast__SvelteComponent_>} SpreadClassLast__SvelteComponent_ */
export default SpreadClassLast__SvelteComponent_;
