import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProfileMenuItem from "carbon-components-svelte/UIShell/ProfileMenuItem.svelte";
import Logout from "carbon-icons-svelte/lib/Logout.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ProfileMenuItem_test($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	ProfileMenuItem(node, {
		'data-testid': 'with-icon',
		get icon() {
			return Logout;
		},

		$$events: {
			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Log out');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ProfileMenuItem(node_1, {
		'data-testid': 'no-icon',
		href: '/settings',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Settings');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}