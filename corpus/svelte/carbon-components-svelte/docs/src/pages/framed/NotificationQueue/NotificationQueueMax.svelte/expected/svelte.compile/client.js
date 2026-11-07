import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function NotificationQueueMax($$anchor) {
	let queue;
	let count = 0;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(NotificationQueue(node, { maxNotifications: 5 }), ($$value) => queue = $$value, () => queue);

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		$$events: {
			click: () => {
				count++;
				queue.add({ kind: "success", title: `Notification ${count}` });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add notification');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}