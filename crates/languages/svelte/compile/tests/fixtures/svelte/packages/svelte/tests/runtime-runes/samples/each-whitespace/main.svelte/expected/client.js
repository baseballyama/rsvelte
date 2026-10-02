import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	$.each(p, 20, () => ['space', ' ', 'between'], $.index, ($$anchor, word) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, word));
		$.append($$anchor, text);
	});

	$.reset(p);
	$.append($$anchor, p);
}