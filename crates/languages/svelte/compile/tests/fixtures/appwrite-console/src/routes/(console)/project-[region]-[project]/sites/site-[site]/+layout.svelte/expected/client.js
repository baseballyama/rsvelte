import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('nz8tn8', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Site - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}