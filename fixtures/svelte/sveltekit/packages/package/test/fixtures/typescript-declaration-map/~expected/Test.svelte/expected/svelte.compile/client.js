import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.foo));
	$.append($$anchor, text);
}