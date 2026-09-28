import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	let double = $.derived(() => ({
		get value() {
			return $.get(count) * 2;
		},

		set value(c) {
			$.set(count, c / 2);
		}
	}));

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1);

	$.template_effect(() => {
		$.set_text(text, `${$.get(count) ?? ''} / ${$.get(double).value ?? ''}`);
		$.set_text(text_1, `${$.get(count) ?? ''} / ${$.get(double).value ?? ''}`);
	});

	$.event('click', button, () => $.update(count));
	$.event('click', button_1, () => $.get(double).value += 2);
	$.append($$anchor, fragment);
}