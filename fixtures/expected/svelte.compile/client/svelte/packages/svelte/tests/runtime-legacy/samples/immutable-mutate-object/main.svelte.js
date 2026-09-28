import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Main($$anchor) {
	let name = { value: 0 };
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);

	$.template_effect(() => {
		$.set_text(text, name.value);
		$.set_text(text_1, name.value);
	});

	$.delegated('click', button, () => name.value++);
	$.delegated('click', button_1, () => name = { value: name.value + 1 });
	$.append($$anchor, fragment);
}

$.delegate(['click']);