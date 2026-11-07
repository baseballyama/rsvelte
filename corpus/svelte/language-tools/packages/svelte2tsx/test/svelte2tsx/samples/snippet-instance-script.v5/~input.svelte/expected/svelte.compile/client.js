import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor) {
	const bar = ($$anchor) => {
		$.next();

		var text = $.text();

		text.nodeValue = 'hello true';
		$.append($$anchor, text);
	};

	let foo = true;

	bar;
}