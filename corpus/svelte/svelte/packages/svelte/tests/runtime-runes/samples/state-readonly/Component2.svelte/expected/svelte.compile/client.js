import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Component2($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.state));
	$.append($$anchor, text);
}