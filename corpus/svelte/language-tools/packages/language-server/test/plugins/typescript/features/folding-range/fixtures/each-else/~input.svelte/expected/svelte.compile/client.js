import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(
		node,
		16,
		() => items,
		$.index,
		($$anchor, item) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, item));
			$.append($$anchor, text);
		},
		($$anchor) => {
			$.next();

			var text_1 = $.text('no items');

			$.append($$anchor, text_1);
		}
	);

	$.append($$anchor, fragment);
}