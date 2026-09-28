import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<span> </span> `, 1);
var root = $.from_html(`<select><option><!></option><option>Plain text</option></select> <button></button>`, 1);

export default function Main($$anchor) {
	let label = $.state('hello');
	let count = 42;
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment_1 = option_content();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span, true);
		var text_1 = $.sibling(span);

		$.template_effect(() => {
			$.set_text(text, $.get(label));
			$.set_text(text_1, ` ${$.get(label) ?? ''}`);
		});

		$.append(anchor, fragment_1);
	});

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';
	$.reset(select);

	var button = $.sibling(select, 2);

	$.delegated('click', button, () => $.set(label, "changed"));
	$.append($$anchor, fragment);
}

$.delegate(['click']);