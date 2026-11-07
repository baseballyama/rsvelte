import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, ({ id }) => id, ($$anchor, $$item) => {
		let id = () => $$item.id;

		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, id()));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}