import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProfileMenuHeader from "carbon-components-svelte/UIShell/ProfileMenuHeader.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ProfileMenuHeader_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ProfileMenuHeader(node, {
		'data-testid': 'default',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/'
	});

	var node_1 = $.sibling(node, 2);

	ProfileMenuHeader(node_1, {
		'data-testid': 'custom',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/',
		text: 'Manage account'
	});

	var node_2 = $.sibling(node_1, 2);

	ProfileMenuHeader(node_2, {
		'data-testid': 'hidden',
		name: 'Richard Hendricks',
		username: 'rhendricks',
		href: '/',
		text: ''
	});

	$.append($$anchor, fragment);
}