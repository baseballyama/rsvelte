import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Input($$anchor, $$props) {
	const id = $.props_id();
	let props = $.rest_props($$props, rest_excludes);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${id} ${props ?? ''}`));
	$.append($$anchor, text);
}