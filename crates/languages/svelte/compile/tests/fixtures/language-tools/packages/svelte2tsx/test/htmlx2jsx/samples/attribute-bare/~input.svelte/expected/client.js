import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <input disabled=""/> <div popover=""></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	SomeComponent(node, { relaxed: true });
	$.next(4);
	$.append($$anchor, fragment);
}