import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	const array = [1, 2, 3, 1];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => array, (item) => item, ($$anchor, item) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, item));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}