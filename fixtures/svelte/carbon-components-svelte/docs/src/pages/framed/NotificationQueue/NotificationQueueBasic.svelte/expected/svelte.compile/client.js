import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function NotificationQueueBasic($$anchor) {
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
							kind: "success",
							title: "Success",
							subtitle: "Your changes have been saved.",
							timeout: 3000
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Show success');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				kind: 'tertiary',
				$$events: {
					click: () => {
						queue.add({
							kind: "error",
							title: "Error",
							subtitle: "An error occurred while processing your request.",
							timeout: 3000
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Show error');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				kind: 'tertiary',
				$$events: {
					click: () => {
						queue.add({
							kind: "info",
							title: "Information",
							subtitle: "New updates are available.",
							timeout: 3000
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Show info');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				kind: 'tertiary',
				$$events: {
					click: () => {
						queue.add({
							kind: "warning",
							title: "Warning",
							subtitle: "This is a warning notification.",
							timeout: 3000
						});
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Show warning');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}