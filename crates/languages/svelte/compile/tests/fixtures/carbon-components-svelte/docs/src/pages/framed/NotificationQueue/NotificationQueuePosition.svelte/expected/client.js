import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <br/> <!>`, 1);

export default function NotificationQueuePosition($$anchor) {
	let topRightQueue;
	let topCenterQueue;
	let topLeftQueue;
	let bottomRightQueue;
	let bottomCenterQueue;
	let bottomLeftQueue;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.bind_this(NotificationQueue(node, { position: 'top-right' }), ($$value) => topRightQueue = $$value, () => topRightQueue);

	var node_1 = $.sibling(node, 2);

	$.bind_this(NotificationQueue(node_1, { position: 'top-center' }), ($$value) => topCenterQueue = $$value, () => topCenterQueue);

	var node_2 = $.sibling(node_1, 2);

	$.bind_this(NotificationQueue(node_2, { position: 'top-left' }), ($$value) => topLeftQueue = $$value, () => topLeftQueue);

	var node_3 = $.sibling(node_2, 2);

	$.bind_this(NotificationQueue(node_3, { position: 'bottom-right' }), ($$value) => bottomRightQueue = $$value, () => bottomRightQueue);

	var node_4 = $.sibling(node_3, 2);

	$.bind_this(NotificationQueue(node_4, { position: 'bottom-center' }), ($$value) => bottomCenterQueue = $$value, () => bottomCenterQueue);

	var node_5 = $.sibling(node_4, 2);

	$.bind_this(NotificationQueue(node_5, { position: 'bottom-left' }), ($$value) => bottomLeftQueue = $$value, () => bottomLeftQueue);

	var node_6 = $.sibling(node_5, 2);

	ButtonSet(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_7 = $.first_child(fragment_1);

			Button(node_7, {
				$$events: {
					click: () => {
						topLeftQueue.add({ kind: "info", title: "Top left" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add top left');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				$$events: {
					click: () => {
						topCenterQueue.add({ kind: "success", title: "Top center" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Add top center');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Button(node_9, {
				$$events: {
					click: () => {
						topRightQueue.add({ kind: "success", title: "Top right" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Add top right');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_6, 4);

	ButtonSet(node_10, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_11 = $.first_child(fragment_2);

			Button(node_11, {
				$$events: {
					click: () => {
						bottomLeftQueue.add({ kind: "warning", title: "Bottom left" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Add bottom left');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_11, 2);

			Button(node_12, {
				$$events: {
					click: () => {
						bottomCenterQueue.add({ kind: "info", title: "Bottom center" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Add bottom center');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				$$events: {
					click: () => {
						bottomRightQueue.add({ kind: "info", title: "Bottom right" });
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Add bottom right');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}