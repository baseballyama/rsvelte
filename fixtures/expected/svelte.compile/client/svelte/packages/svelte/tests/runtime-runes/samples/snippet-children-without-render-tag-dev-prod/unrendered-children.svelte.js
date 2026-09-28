import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Unrendered_children($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.children));
	$.append($$anchor, text);
}