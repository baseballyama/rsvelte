import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="id"/>`);

export default function HeadNested($$anchor) {
	const id = $.props_id();
	var meta = root();

	$.template_effect(() => $.set_attribute(meta, 'content', id));
	$.append($$anchor, meta);
}