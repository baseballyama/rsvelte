import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProfileMenuItem from "carbon-components-svelte/UIShell/ProfileMenuItem.svelte";
import ProfileMenuList from "carbon-components-svelte/UIShell/ProfileMenuList.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ProfileMenuList_test($$anchor) {
	ProfileMenuList($$anchor, {
		'data-testid': 'list',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ProfileMenuItem(node, {
				href: '/settings',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Settings');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ProfileMenuItem(node_1, {
				href: '/privacy',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Privacy');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}