import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.data ?? ''}, ${$$props.errors ?? ''}, ${$$props.foo ?? ''}, ${$$props.bar ?? ''}`));
	$.append($$anchor, text);
}