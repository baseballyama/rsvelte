import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Head_template_title($$anchor, $$props) {
	$.push($$props, true);
	$.head('14jc3f0', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${$$props.status ?? ''}: ${$$props.error?.message ?? ''}`;
		});
	});
	$.pop();
}
