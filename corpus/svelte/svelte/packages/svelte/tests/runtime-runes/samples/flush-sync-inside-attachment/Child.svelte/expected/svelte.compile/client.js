import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Child($$anchor, $$props) {
	$.push($$props, true);
	$.user_effect(() => console.log($$props.text));
	$.next();

	var text_1 = $.text();

	$.template_effect(() => $.set_text(text_1, $$props.text));
	$.append($$anchor, text_1);
	$.pop();
}