import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);
	console.log($$props.x);
	$.user_effect(() => console.log('$effect: ' + $$props.x));
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $$props.x));
	$.append($$anchor, text);
	$.pop();
}