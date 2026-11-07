import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function NotificationQueueDeduplication($$anchor) {
	let queue;
	let count = 0;
	var fragment = root();
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
							id: "id",
							kind: "warning",
							title: "Duplicate notification",
							subtitle: "This notification has the same id. Click the button multiple times."
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add duplicate');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				$$events: {
					click: () => {
						queue.add({
							id: `id-${count++}`,
							kind: "info",
							title: "Unique notification",
							subtitle: "This has a unique id, so it will always appear."
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Add unique');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}