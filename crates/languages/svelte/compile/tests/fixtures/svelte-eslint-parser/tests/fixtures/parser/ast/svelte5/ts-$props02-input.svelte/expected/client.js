import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Ts_$props02_input($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.name));
	$.append($$anchor, text);
}