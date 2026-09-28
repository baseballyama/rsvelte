import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function NotificationQueueRemove($$anchor) {
	let queue;
	let notificationIds = [];
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
						const id = queue.add({
							kind: "info",
							title: "Removable notification",
							subtitle: "This notification can be removed programmatically.",
							timeout: 0
						});

						notificationIds = [...notificationIds, id];
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add notification');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				$$events: {
					click: () => {
						if (notificationIds.length > 0) {
							const id = notificationIds[notificationIds.length - 1];

							queue.remove(id);
							notificationIds = notificationIds.slice(0, -1);
						}
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Remove last');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				$$events: {
					click: () => {
						queue.clear();
						notificationIds = [];
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