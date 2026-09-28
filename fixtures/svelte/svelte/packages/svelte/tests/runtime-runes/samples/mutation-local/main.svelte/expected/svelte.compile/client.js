import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	function localMutation(input) {
		// Tests that this does not become a signal which would cause an "cannot mutate during render" error
		let x = input;

		if (x > 0) {
			x = 2;
		}

		return x;
	}

	const x = localMutation(1);

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, x));
	$.append($$anchor, text);
}