import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

export default function Each_static($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 16, () => [1, 2, 3], $.index, ($$anchor, n) => {
		$.next();
		var text = $.text();
		$.template_effect(() => $.set_text(text, n));
		$.append($$anchor, text);
	});
	$.append($$anchor, fragment);
}
