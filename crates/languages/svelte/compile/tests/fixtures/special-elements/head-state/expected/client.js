import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>change</button>`);

export default function Head_state($$anchor) {
	let title = $.state("Hello");
	var button = root();
	$.head('b0p9we', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $.get(title) ?? '';
		});
	});
	$.delegated('click', button, () => $.set(title, "new"));
	$.append($$anchor, button);
}

$.delegate(['click']);
