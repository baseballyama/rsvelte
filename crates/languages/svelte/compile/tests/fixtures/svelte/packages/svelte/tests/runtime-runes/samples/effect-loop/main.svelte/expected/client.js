import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	$.user_effect(() => {
		if ($.get(count) < 5) {
			$.update(count);
		}
	});

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.append($$anchor, text);
	$.pop();
}