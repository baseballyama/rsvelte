import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Head_whitespace($$anchor) {
	$.head('qw3wt0', ($$anchor) => {
		$.effect(() => {
			$.document.title = '  Hello  ';
		});
	});
}
