import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>set</button> <button>delete</button> <p> </p> <p> </p>`, 1);

export default function Main($$anchor) {
	let numbers = $.proxy({ a: 1, b: 2, c: 3 });
	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var p = $.sibling(button_1, 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[() => Object.keys(numbers), () => JSON.stringify(numbers)]
	);

	$.delegated('click', button, () => {
		numbers.b = 2;
	});

	$.delegated('click', button_1, () => {
		delete numbers.b;
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);