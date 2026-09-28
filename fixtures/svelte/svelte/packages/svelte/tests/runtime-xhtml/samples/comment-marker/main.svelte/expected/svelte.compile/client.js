import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => [1, 2], $.index, ($$anchor, i) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, i));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}