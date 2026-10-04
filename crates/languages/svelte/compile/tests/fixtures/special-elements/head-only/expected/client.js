import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Head_only($$anchor) {
	$.head('85k2v7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Hello';
		});
	});
}
