import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'name']);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${rest.name ?? ''} ${'name' in rest}`));
	$.append($$anchor, text);
	$.pop();
}