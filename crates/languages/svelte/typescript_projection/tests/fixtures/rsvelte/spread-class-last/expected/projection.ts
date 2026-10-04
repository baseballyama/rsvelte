;

	import { vmodel, vModelText } from './runtime.js';

	let { own = 'a', ...rest }: typeof __rsvelte_public_props0 = $props();
	let text = $state('');
	let attrs = $derived.by(() => ({ ...rest, title: text }));

	function onClick() {
		text = '';
	}

;

const __rsvelte_public_props0 = __rsvelte_props({}, {
  own: 'a',
}, true);
{
  svelteHTML.createElement("input", {
    type: "text",
    onclick: onClick,
    ...(attrs),
    class: 'class' in attrs ? [own, attrs.class] : own,
  });
}
{
  svelteHTML.createElement("input", {
    type: "text",
    [Symbol("@attach")]: vmodel(vModelText, () => text, {}, { 'onUpdate:modelValue': (v) => (text = v) }),
  });
}
{
  svelteHTML.createElement("div", {
    onclick: () => (text = 'x'),
    ...(attrs),
  });
  (text);
}
export default __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
