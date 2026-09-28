import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const data = $.prop($$props, 'data', 3, 123);

	onDestroy(() => {
		data();
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, data() ? '' : null));
	$.append($$anchor, text);
	$.pop();
}