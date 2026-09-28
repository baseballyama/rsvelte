import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	$.head('1rapjn4', ($$anchor) => {
		$.effect(() => {
			$.document.title = '';
		});
	});
}