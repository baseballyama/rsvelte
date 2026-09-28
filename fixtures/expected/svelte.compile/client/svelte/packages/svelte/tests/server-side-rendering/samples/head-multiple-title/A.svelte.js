import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function A($$anchor) {
	$.head('zzwr0v', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'A';
		});
	});
}