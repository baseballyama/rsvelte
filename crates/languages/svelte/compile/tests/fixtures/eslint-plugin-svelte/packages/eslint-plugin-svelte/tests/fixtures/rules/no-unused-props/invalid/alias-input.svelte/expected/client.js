import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Alias_input($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props['aria-label']));
	$.append($$anchor, text);
}