import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'a', 'b', 'c']);

export default function Ts_$props01_input($$anchor, $$props) {
	let everythingElse = $.rest_props($$props, rest_excludes);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${$$props.a ?? ''}
${$$props.b ?? ''}
${$$props.c ?? ''}
${everythingElse ?? ''}`));

	$.append($$anchor, text);
}