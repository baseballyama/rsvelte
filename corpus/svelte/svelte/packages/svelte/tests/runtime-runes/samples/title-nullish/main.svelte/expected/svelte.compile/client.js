import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	const thing = {};

	$.head('1obi4vh', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = thing.thing ?? '';
		});
	});
}