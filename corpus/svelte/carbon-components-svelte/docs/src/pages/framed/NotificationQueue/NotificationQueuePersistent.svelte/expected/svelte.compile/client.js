import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function NotificationQueuePersistent($$anchor) {
	let queue;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(NotificationQueue(node, {}), ($$value) => queue = $$value, () => queue);

	var node_1 = $.sibling(node, 2);

	ButtonSet(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Button(node_2, {
				$$events: {
					click: () => {
						queue.add({
							kind: "warning",
							title: "Persistent notification",
							subtitle: "This notification has no close button and will not auto-dismiss.",
							hideCloseButton: true
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add persistent');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				$$events: {
					click: () => {
						queue.add({
							kind: "info",
							title: "Auto-dismiss notification",
							subtitle: "This notification has no close button but will auto-dismiss after 3 seconds.",
							hideCloseButton: true,
							timeout: 3000
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Add auto-dismiss');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				$$events: {
					click: () => {
						queue.clear();
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Clear all');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}