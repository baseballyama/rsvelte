;

	import { vmodel, vModelText } from './runtime.js';

	/** @type {typeof __rsvelte_public_props0} */ let { own = 'a', ...rest } = $props();
	let text = $state('');
	let attrs = $derived.by(() => ({ ...rest, title: text }));

	function onClick() {
		text = '';
	}

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  own: 'a',
}, true);
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
    (text);
  }
};
const SpreadClassLast__SvelteComponent_ = (/** @type {typeof __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">} */ (__rsvelte_export_component))();
export default /** @type {__rsvelte_javascript_export<typeof SpreadClassLast__SvelteComponent_>} */ (SpreadClassLast__SvelteComponent_);
