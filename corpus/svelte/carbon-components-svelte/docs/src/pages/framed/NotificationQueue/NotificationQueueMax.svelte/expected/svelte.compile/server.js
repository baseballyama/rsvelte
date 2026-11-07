import * as $ from 'svelte/internal/server';
import { Button, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueMax($$renderer) {
	let queue;
	let count = 0;

	NotificationQueue($$renderer, { maxNotifications: 5 });
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Add notification`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}