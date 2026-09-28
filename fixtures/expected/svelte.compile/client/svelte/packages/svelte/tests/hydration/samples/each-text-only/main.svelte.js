import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => 'abc', $.index, ($$anchor, l) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, l));
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}