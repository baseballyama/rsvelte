import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('d7yfve', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Webhook - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}