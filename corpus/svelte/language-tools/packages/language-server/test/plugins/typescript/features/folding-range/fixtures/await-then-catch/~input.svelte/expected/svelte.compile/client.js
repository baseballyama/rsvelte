import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => Promise.resolve(),
		null,
		($$anchor, value) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $.get(value)));
			$.append($$anchor, text);
		},
		($$anchor, error) => {
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(error)));
			$.append($$anchor, text_1);
		}
	);

	$.append($$anchor, fragment);
}