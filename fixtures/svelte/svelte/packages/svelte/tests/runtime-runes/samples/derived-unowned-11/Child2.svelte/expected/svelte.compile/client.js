import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child2($$anchor, $$props) {
	let disabled = $.prop($$props, 'disabled', 3, false);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, disabled()));
	$.append($$anchor, text);
}