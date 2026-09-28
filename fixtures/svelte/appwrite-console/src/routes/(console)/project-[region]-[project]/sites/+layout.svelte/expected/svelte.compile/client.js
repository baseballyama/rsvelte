import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('1nerrbw', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sites - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}