import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.value));
	$.append($$anchor, text);
	$.pop();
}