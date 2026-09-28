import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let foo = $.prop($$props, 'foo', 11, 42);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${foo() ?? ''};`));
	$.append($$anchor, text);
	$.pop();
}