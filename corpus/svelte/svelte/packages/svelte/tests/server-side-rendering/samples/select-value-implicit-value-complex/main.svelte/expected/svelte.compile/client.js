import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const option = ($$anchor, val = $.noop) => {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, val()));
	$.append($$anchor, text);
};

var root = $.from_html(`<select><option><!></option><option><!></option><option><!></option></select>`);

export default function Main($$anchor) {
	var select = root();
	var option_1 = $.child(select);

	$.customizable_select(option_1, () => {
		var anchor = $.child(option_1);
		var fragment_1 = $.comment();
		var node = $.first_child(fragment_1);

		option(node, () => "--Please choose an option--");
		$.append(anchor, fragment_1);
	});

	var option_2 = $.sibling(option_1);

	$.customizable_select(option_2, () => {
		var anchor_1 = $.child(option_2);
		var fragment_2 = $.comment();
		var node_1 = $.first_child(fragment_2);

		option(node_1, () => "dog");
		$.append(anchor_1, fragment_2);
	});

	var option_3 = $.sibling(option_2);

	$.customizable_select(option_3, () => {
		var anchor_2 = $.child(option_3);
		var fragment_3 = $.comment();
		var node_2 = $.first_child(fragment_3);

		option(node_2, () => "cat");
		$.append(anchor_2, fragment_3);
	});

	$.reset(select);
	select.value = select.__value = 'dog';
	$.append($$anchor, select);
}