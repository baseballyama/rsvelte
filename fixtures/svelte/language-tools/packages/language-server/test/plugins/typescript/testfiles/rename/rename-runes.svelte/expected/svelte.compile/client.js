import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Rename_runes($$anchor, $$props) {
	$.push($$props, true);
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.foo ?? ''}
${$$props.bar ?? ''}`));

	$.append($$anchor, text);
	$.pop();
}