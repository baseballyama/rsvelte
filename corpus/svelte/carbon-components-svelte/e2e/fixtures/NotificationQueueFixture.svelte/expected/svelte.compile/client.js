import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, NotificationQueue } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="notification-queue-root"><!> <!> <!> <!> <!> <!></div>`);

export default function NotificationQueueFixture($$anchor) {
	let queue;
	var div = root();
	var node = $.child(div);

	$.bind_this(NotificationQueue(node, { maxNotifications: 2 }), ($$value) => queue = $$value, () => queue);

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		'data-testid': 'nq-add',
		$$events: {
			click: () => {
				queue?.add({ title: "Toast A" });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Add toast');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		'data-testid': 'nq-t1',
		$$events: {
			click: () => {
				queue?.add({ title: "T1" });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('T1');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		'data-testid': 'nq-t2',
		$$events: {
			click: () => {
				queue?.add({ title: "T2" });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('T2');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		'data-testid': 'nq-t3',
		$$events: {
			click: () => {
				queue?.add({ title: "T3" });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('T3');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		'data-testid': 'nq-timed',
		$$events: {
			click: () => {
				queue?.add({ title: "Quick", timeout: 400 });
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Add timed');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}