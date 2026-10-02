import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<span> </span> A`, 1);
var option_content_1 = $.from_html(`<strong></strong> B`, 1);
var root = $.from_html(`<select><option><!></option><option><!></option><option>Plain C</option></select> <p> </p> <button>Change A</button>`, 1);

export default function Main($$anchor) {
	let selected = $.state('a');
	let label_a = $.state('Option');
	let label_b = 'Strong';
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment_1 = option_content();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span, true);

		$.next();
		$.template_effect(() => $.set_text(text, $.get(label_a)));
		$.append(anchor, fragment_1);
	});

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	$.customizable_select(option_1, () => {
		var anchor_1 = $.child(option_1);
		var fragment_2 = option_content_1();
		var strong = $.first_child(fragment_2);

		strong.textContent = 'Strong';
		$.next();
		$.append(anchor_1, fragment_2);
	});

	option_1.value = option_1.__value = 'b';

	var option_2 = $.sibling(option_1);

	option_2.value = option_2.__value = 'c';
	$.reset(select);
	$.init_select(select);

	var p = $.sibling(select, 2);
	var text_1 = $.only_child(p);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text_1, `Selected: ${$.get(selected) ?? ''}`));
	$.bind_select_value(select, () => $.get(selected), ($$value) => $.set(selected, $$value));
	$.delegated('click', button, () => $.set(label_a, 'Changed'));
	$.append($$anchor, fragment);
}

$.delegate(['click']);