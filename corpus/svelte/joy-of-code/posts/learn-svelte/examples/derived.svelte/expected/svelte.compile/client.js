import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div><p class="svelte-anvqu"> </p> <button> </button> <button> </button></div></div>`);

export default function Derived($$anchor) {
	let count = $.state(0);
	let factor = $.state(2);
	let result = $.derived(() => $.get(count) * $.get(factor));
	var div = root();
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var text = $.only_child(p);
	var button = $.sibling(p, 2);
	var text_1 = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_2 = $.only_child(button_1);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `${$.get(count) ?? ''} * ${$.get(factor) ?? ''} = ${$.get(result) ?? ''}`);
		$.set_text(text_1, `Count: ${$.get(count) ?? ''}`);
		$.set_text(text_2, `Factor: ${$.get(factor) ?? ''}`);
	});

	$.delegated('click', button, () => $.update(count));
	$.delegated('click', button_1, () => $.update(factor));
	$.append($$anchor, div);
}

$.delegate(['click']);