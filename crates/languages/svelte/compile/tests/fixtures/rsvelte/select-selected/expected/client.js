import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { vmodel, vModelSelect, looseEqual } from './runtime.js';

var root = $.from_html(`<select><option>A</option><option>B</option><option>c</option></select>`);

export default function Select_selected($$anchor, $$props) {
	$.push($$props, true);
	let model = $.state('b');
	var select = root();
	var option = $.child(select);
	option.value = option.__value = 'a';
	var option_1 = $.sibling(option);
	option_1.value = option_1.__value = 'b';
	var option_2 = $.sibling(option_1);
	$.reset(select);
	$.attach(select, () => vmodel(vModelSelect, () => $.get(model), {}, { 'onUpdate:modelValue': (v) => $.set(model, v, true) }));
	$.template_effect(($0, $1) => {
		$.set_selected(option, $0);
		$.set_selected(option_1, $1);
		option_2.disabled = $.get(model) === 'a' ? '' : undefined;
	}, [() => looseEqual($.get(model), 'a') ? '' : undefined, () => looseEqual($.get(model), 'b') ? '' : undefined]);
	$.append($$anchor, select);
	$.pop();
}
