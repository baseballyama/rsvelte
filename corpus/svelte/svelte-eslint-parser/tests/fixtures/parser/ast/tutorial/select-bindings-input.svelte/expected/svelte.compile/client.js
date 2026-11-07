import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<h2>Insecurity questions</h2> <form><select></select> <input class="svelte-1gf1md7"/> <button type="submit">Submit</button></form> <p> </p>`, 1);

export default function Select_bindings_input($$anchor) {
	let questions = [
		{ id: 1, text: `Where did you go to school?` },
		{ id: 2, text: `What is your mother's name?` },
		{
			id: 3,
			text: `What is another personal fact that an attacker could easily find with Google?`
		}
	];

	let selected;
	let answer = '';

	function handleSubmit() {
		alert(`answered question ${selected.id} (${selected.text}) with "${answer}"`);
	}

	var fragment = root_1();
	var form = $.sibling($.first_child(fragment), 2);
	var select = $.child(form);

	$.each(select, 21, () => questions, $.index, ($$anchor, question) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(question).text);

			if (option_value !== (option_value = $.get(question))) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);

	var input = $.sibling(select, 2);

	$.remove_input_defaults(input);

	var button = $.sibling(input, 2);

	$.reset(form);

	var p = $.sibling(form, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		button.disabled = !answer;
		$.set_text(text_1, `selected question ${(selected ? selected.id : '[waiting...]') ?? ''}`);
	});

	$.bind_select_value(select, () => selected, ($$value) => selected = $$value);
	$.event('change', select, () => answer = '');
	$.bind_value(input, () => answer, ($$value) => answer = $$value);
	$.event('submit', form, $.preventDefault(handleSubmit));
	$.append($$anchor, fragment);
}