import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { vmodel, vModelText } from './runtime.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'own']);
var root = $.from_html(`<input/> <input type="text"/> <div> </div>`, 1);

export default function Spread_class_last($$anchor, $$props) {
	$.push($$props, true);

	let own = $.prop($$props, 'own', 3, 'a'),
		rest = $.rest_props($$props, rest_excludes);

	let text = $.state('');
	let attrs = $.derived(() => ({ ...rest, title: $.get(text) }));

	function onClick() {
		$.set(text, '');
	}

	var fragment = root();
	var input = $.first_child(fragment);

	$.attribute_effect(
		input,
		() => ({
			type: 'text',
			onclick: onClick,
			...$.get(attrs),
			class: 'class' in $.get(attrs) ? [own(), $.get(attrs).class] : own()
		}),
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	var input_1 = $.sibling(input, 2);

	$.attach(input_1, () => vmodel(vModelText, () => $.get(text), {}, { 'onUpdate:modelValue': (v) => $.set(text, v, true) }));

	var div = $.sibling(input_1, 2);
	var event_handler = () => $.set(text, 'x');

	$.attribute_effect(div, () => ({ onclick: event_handler, ...$.get(attrs) }));

	var text_1 = $.only_child(div, true);

	$.template_effect(() => $.set_text(text_1, $.get(text)));
	$.append($$anchor, fragment);
	$.pop();
}