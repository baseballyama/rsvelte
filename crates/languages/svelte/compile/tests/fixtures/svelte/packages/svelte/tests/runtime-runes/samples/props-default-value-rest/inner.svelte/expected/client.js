import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	let options = $.prop($$props, 'options', 15, 'foo');

	options('bar');
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, options()));
	$.append($$anchor, text);
	$.pop();
}