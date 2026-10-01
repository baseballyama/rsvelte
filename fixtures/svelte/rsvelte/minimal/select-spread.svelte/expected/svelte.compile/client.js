import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'options']);
var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select><!><optgroup label="more"><option>other</option></optgroup></select>`);

export default function Select_spread($$anchor, $$props) {
	let options = $.prop($$props, 'options', 19, () => []),
		rest = $.rest_props($$props, rest_excludes);

	let current = $.state('x');
	var select = root_1();

	$.attribute_effect(select, () => ({ ...rest, class: 'picker' }), void 0, void 0, void 0, 'svelte-1rzblzg');

	var node = $.child(select);

	$.each(node, 17, options, $.index, ($$anchor, option) => {
		var option_1 = root();
		let classes;
		var text = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			classes = $.set_class(option_1, 1, 'svelte-1rzblzg', null, classes, { current: $.get(option) === $.get(current) });
			$.set_text(text, $.get(option));

			if (option_1_value !== (option_1_value = $.get(option))) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	var optgroup = $.sibling(node);
	var option_2 = $.child(optgroup);

	$.attribute_effect(option_2, () => ({ ...rest }), void 0, void 0, void 0, 'svelte-1rzblzg');
	$.reset(optgroup);
	$.reset(select);
	$.bind_select_value(select, () => $.get(current), ($$value) => $.set(current, $$value));
	$.append($$anchor, select);
}