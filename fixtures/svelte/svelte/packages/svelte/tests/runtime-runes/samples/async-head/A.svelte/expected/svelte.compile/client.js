import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta/>`);

export default function A($$anchor, $$props) {
	$.head('6p7wes', ($$anchor) => {
		var meta = root();

		$.template_effect(() => {
			$.set_attribute(meta, 'name', $$props.name);
			$.set_attribute(meta, 'content', $$props.content);
		});

		$.append($$anchor, meta);
	});
}