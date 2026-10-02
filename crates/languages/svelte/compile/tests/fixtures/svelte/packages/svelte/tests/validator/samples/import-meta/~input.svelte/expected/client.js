import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const url = import.meta.url;

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${url ?? ''}
${import.meta.url ?? ''}`));

	$.append($$anchor, text);
	$.pop();
}