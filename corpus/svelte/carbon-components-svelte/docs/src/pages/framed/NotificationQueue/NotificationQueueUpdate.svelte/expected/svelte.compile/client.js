import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function NotificationQueueUpdate($$anchor) {
	let queue;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(NotificationQueue(node, {}), ($$value) => queue = $$value, () => queue);

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		$$events: {
			click: () => {
				const id = queue.add({
					id: "upload",
					kind: "info",
					title: "Uploading...",
					subtitle: "0%",
					hideCloseButton: true
				});

				let progress = 0;

				const interval = setInterval(
					() => {
						progress += 25;

						if (progress < 100) {
							queue.update(id, { subtitle: `${progress}%` });
						} else {
							clearInterval(interval);

							queue.update(id, {
								kind: "success",
								title: "Upload complete",
								subtitle: "All files have been uploaded.",
								hideCloseButton: false,
								timeout: 3000
							});
						}
					},
					600
				);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Start upload');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}