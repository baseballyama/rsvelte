import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);

export default function Main($$anchor) {
	var div = root();

	{
		let dt = $.derived(() => Date.parse("2026-10-01T00:00:00Z"));
		var text = $.only_child(div, true);

		$.template_effect(() => $.set_text(text, typeof $.get(dt)));
	}

	$.append($$anchor, div);
}