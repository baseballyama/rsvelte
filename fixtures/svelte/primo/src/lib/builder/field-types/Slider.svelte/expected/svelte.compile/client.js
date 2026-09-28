import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-eoac43"><p class="label svelte-eoac43"> </p> <div class="container svelte-eoac43"><p class="value svelte-eoac43"> </p> <input class="input svelte-eoac43" type="range"/></div></div>`);

export default function Slider($$anchor, $$props) {
	$.push($$props, true);

	const value = $.derived(() => $$props.entry?.value ?? '');
	var div = root();
	var p = $.child(div);
	var text = $.only_child(p, true);
	var div_1 = $.sibling(p, 2);
	var p_1 = $.child(div_1);
	var text_1 = $.only_child(p_1, true);
	var input = $.sibling(p_1, 2);

	$.remove_input_defaults(input);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.field.label);
		$.set_text(text_1, $.get(value));
		$.set_value(input, $.get(value));
	});

	$.delegated('input', input, ({ target }) => $$props.onchange({ [$$props.field.key]: { 0: { value: target.value } } }));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);