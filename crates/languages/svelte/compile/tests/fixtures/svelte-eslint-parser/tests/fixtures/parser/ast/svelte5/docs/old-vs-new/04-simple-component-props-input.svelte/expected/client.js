import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _4_simple_component_props_input($$anchor, $$props) {
	let count = $.prop($$props, 'count', 3, 0);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, count()));
	$.append($$anchor, text);
}