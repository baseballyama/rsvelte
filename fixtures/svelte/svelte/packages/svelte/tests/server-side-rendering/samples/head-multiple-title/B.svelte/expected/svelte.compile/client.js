import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function B($$anchor) {
	$.head('7h7j1o', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'B';
		});
	});
}