import * as $ from 'svelte/internal/server';
import { Button, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueOffsets($$renderer) {
	let queue;

	NotificationQueue($$renderer, {
		position: 'top-right',
		offsetTop: '5rem',
		offsetRight: '2rem'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Add notification`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}