import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.prop));
	$.append($$anchor, text);
}