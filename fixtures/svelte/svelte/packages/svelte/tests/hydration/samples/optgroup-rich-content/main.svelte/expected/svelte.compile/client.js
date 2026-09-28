import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<span> </span> `, 1);
var optgroup_content = $.from_html(`<span class="group-header"> </span> <option><!></option> <option>Plain option</option>`, 1);
var root = $.from_html(`<select><optgroup label="Fruits"><!></optgroup><optgroup label="Static Group"><option>Another option</option></optgroup></select> <button></button>`, 1);

export default function Main($$anchor) {
	let label = $.state('hello');
	var fragment = root();
	var select = $.first_child(fragment);
	var optgroup = $.child(select);

	$.customizable_select(optgroup, () => {
		var anchor = $.child(optgroup);
		var fragment_1 = optgroup_content();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span, true);
		var option = $.sibling(span, 2);

		$.customizable_select(option, () => {
			var anchor_1 = $.child(option);
			var fragment_2 = option_content();
			var span_1 = $.first_child(fragment_2);
			var text_1 = $.only_child(span_1, true);
			var text_2 = $.sibling(span_1);

			$.template_effect(() => {
				$.set_text(text_1, $.get(label));
				$.set_text(text_2, ` ${$.get(label) ?? ''}`);
			});

			$.append(anchor_1, fragment_2);
		});

		option.value = option.__value = 'a';

		var option_1 = $.sibling(option, 2);

		option_1.value = option_1.__value = 'b';
		$.template_effect(() => $.set_text(text, $.get(label)));
		$.append(anchor, fragment_1);
	});

	var optgroup_1 = $.sibling(optgroup);
	var option_2 = $.child(optgroup_1);

	option_2.value = option_2.__value = 'c';
	$.reset(optgroup_1);
	$.reset(select);

	var button = $.sibling(select, 2);

	$.delegated('click', button, () => $.set(label, "changed"));
	$.append($$anchor, fragment);
}

$.delegate(['click']);