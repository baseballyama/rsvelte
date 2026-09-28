import * as $ from 'svelte/internal/server';
import { Button, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueFixture($$renderer) {
	let queue;

	$$renderer.push(`<div data-testid="notification-queue-root">`);
	NotificationQueue($$renderer, { maxNotifications: 2 });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'nq-add',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Add toast`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'nq-t1',
		children: ($$renderer) => {
			$$renderer.push(`<!---->T1`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'nq-t2',
		children: ($$renderer) => {
			$$renderer.push(`<!---->T2`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'nq-t3',
		children: ($$renderer) => {
			$$renderer.push(`<!---->T3`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'nq-timed',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Add timed`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}