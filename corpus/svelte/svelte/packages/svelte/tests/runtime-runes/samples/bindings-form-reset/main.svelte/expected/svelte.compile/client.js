import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <form><input/> <input type="checkbox"/> <input type="radio" name="radio"/> <input type="radio" name="radio"/> <input type="checkbox" name="checkbox"/> <input type="checkbox" name="checkbox"/> <select><option>a</option><option>b</option></select> <textarea></textarea> <button type="button">Reset</button></form>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];
	const binding_group_1 = [];
	let text = $.state('text');
	let checkbox = $.state(true);
	let radio_group = $.state('a');
	let checkbox_group = $.state($.proxy(['a']));

	// this will be ssrd
	let select = $.state('a');

	let textarea = $.state('textarea');

	$.user_effect(() => {
		// changing the value of `select` on mount
		$.set(select, 'b');
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text_1 = $.only_child(p, true);
	var form = $.sibling(p, 2);
	var input = $.child(form);

	$.remove_input_defaults(input);

	var input_1 = $.sibling(input, 2);

	$.remove_input_defaults(input_1);

	var input_2 = $.sibling(input_1, 2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'a';

	var input_3 = $.sibling(input_2, 2);

	$.remove_input_defaults(input_3);
	input_3.value = input_3.__value = 'b';

	var input_4 = $.sibling(input_3, 2);

	$.remove_input_defaults(input_4);
	input_4.value = input_4.__value = 'a';

	var input_5 = $.sibling(input_4, 2);

	$.remove_input_defaults(input_5);
	input_5.value = input_5.__value = 'b';

	var select_1 = $.sibling(input_5, 2);
	var option = $.child(select_1);

	option.value = option.__value = 'a';

	var option_1 = $.sibling(option);

	option_1.value = option_1.__value = 'b';
	$.reset(select_1);
	$.init_select(select_1);

	var textarea_1 = $.sibling(select_1, 2);

	$.remove_textarea_child(textarea_1);

	var button = $.sibling(textarea_1, 2);

	$.reset(form);

	$.template_effect(($0) => $.set_text(text_1, $0), [
		() => JSON.stringify({
			text: $.get(text),
			checkbox: $.get(checkbox),
			radio_group: $.get(radio_group),
			checkbox_group: $.get(checkbox_group),
			select: $.get(select),
			textarea: $.get(textarea)
		})
	]);

	$.bind_value(input, () => $.get(text), ($$value) => $.set(text, $$value));
	$.bind_checked(input_1, () => $.get(checkbox), ($$value) => $.set(checkbox, $$value));
	$.bind_group(binding_group, [], input_2, () => $.get(radio_group), ($$value) => $.set(radio_group, $$value));
	$.bind_group(binding_group, [], input_3, () => $.get(radio_group), ($$value) => $.set(radio_group, $$value));
	$.bind_group(binding_group_1, [], input_4, () => $.get(checkbox_group), ($$value) => $.set(checkbox_group, $$value));
	$.bind_group(binding_group_1, [], input_5, () => $.get(checkbox_group), ($$value) => $.set(checkbox_group, $$value));
	$.bind_select_value(select_1, () => $.get(select), ($$value) => $.set(select, $$value));
	$.bind_value(textarea_1, () => $.get(textarea), ($$value) => $.set(textarea, $$value));
	$.delegated('click', button, (e) => e.target.form.reset());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);