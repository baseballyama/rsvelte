import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<select><option> </option><option> </option></select>`);

export default function Main($$anchor, $$props) {
	let selectedBook = $.prop($$props, 'selectedBook', 3, "a</option><sc" + "ript>alert(\"pwnd\")</sc" + "ript><option>puppa");
	var select = root();
	var option = $.child(select);
	var text = $.only_child(option, true);
	var option_value = {};
	var option_1 = $.sibling(option);
	var text_1 = $.only_child(option_1);

	$.reset(select);

	$.template_effect(() => {
		$.set_text(text, selectedBook());

		if (option_value !== (option_value = selectedBook())) {
			option.__value = option_value;
		}

		$.set_text(text_1, `selected: ${selectedBook() ?? ''}`);
	});

	$.append($$anchor, select);
}