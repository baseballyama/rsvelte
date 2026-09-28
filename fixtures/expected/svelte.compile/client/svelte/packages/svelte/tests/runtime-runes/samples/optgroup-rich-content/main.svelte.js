import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var option_content = $.from_html(`<span> </span> `, 1);
var optgroup_content = $.from_html(`<span class="fruits-header"> </span> <option><!></option> <option>banana</option>`, 1);
var option_content_1 = $.from_html(`<em> </em> `, 1);
var optgroup_content_1 = $.from_html(`<em class="veggies-header"> </em> <option><!></option> <option>Plain celery</option>`, 1);
var root = $.from_html(`<select><optgroup label="Fruits"><!></optgroup><optgroup label="Vegetables"><!></optgroup></select> <button>Change</button>`, 1);

export default function Main($$anchor) {
	let fruit = $.state('apple');
	let vegetable = $.state('carrot');
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
				$.set_text(text_1, $.get(fruit));
				$.set_text(text_2, ` ${$.get(fruit) ?? ''}`);
			});

			$.append(anchor_1, fragment_2);
		});

		option.value = option.__value = 'a';

		var option_1 = $.sibling(option, 2);

		option_1.value = option_1.__value = 'b';
		$.template_effect(() => $.set_text(text, $.get(fruit)));
		$.append(anchor, fragment_1);
	});

	var optgroup_1 = $.sibling(optgroup);

	$.customizable_select(optgroup_1, () => {
		var anchor_2 = $.child(optgroup_1);
		var fragment_3 = optgroup_content_1();
		var em = $.first_child(fragment_3);
		var text_3 = $.only_child(em, true);
		var option_2 = $.sibling(em, 2);

		$.customizable_select(option_2, () => {
			var anchor_3 = $.child(option_2);
			var fragment_4 = option_content_1();
			var em_1 = $.first_child(fragment_4);
			var text_4 = $.only_child(em_1, true);
			var text_5 = $.sibling(em_1);

			$.template_effect(() => {
				$.set_text(text_4, $.get(vegetable));
				$.set_text(text_5, ` ${$.get(vegetable) ?? ''}`);
			});

			$.append(anchor_3, fragment_4);
		});

		option_2.value = option_2.__value = 'c';

		var option_3 = $.sibling(option_2, 2);

		option_3.value = option_3.__value = 'd';
		$.template_effect(() => $.set_text(text_3, $.get(vegetable)));
		$.append(anchor_2, fragment_3);
	});

	$.reset(select);

	var button = $.sibling(select, 2);

	$.delegated('click', button, () => {
		$.set(fruit, 'orange');
		$.set(vegetable, 'broccoli');
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);