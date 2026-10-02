import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Portal, UserAvatar } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function UserAvatarModal($$anchor) {
	let open = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Portal(node_1, {
		children: ($$anchor, $$slotProps) => {
			Modal($$anchor, {
				size: 'sm',
				modalHeading: 'UserAvatar in modal',
				primaryButtonText: 'Done',
				secondaryButtonText: 'Cancel',
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},
				$$events: { 'click:button--secondary': () => open = false },
				children: ($$anchor, $$slotProps) => {
					UserAvatar($$anchor, {
						name: 'Richard Hendricks',
						tooltipText: 'Richard Hendricks',
						direction: 'bottom'
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}