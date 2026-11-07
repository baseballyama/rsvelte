import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	let items = [1];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => items, $.index, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(item)));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}