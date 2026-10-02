import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Output($$anchor, $$props) {
	let klass = $.prop($$props, 'class', 3, '');

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, klass()));
	$.append($$anchor, text);
}