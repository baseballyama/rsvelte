import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function ValueComponent($$anchor, $$props) {
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.value ?? ''}
${$$props.defaultValue ?? ''}`));

	$.append($$anchor, text);
}