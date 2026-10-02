import * as $ from 'svelte/internal/server';
import { Button, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueUpdate($$renderer) {
	let queue;

	NotificationQueue($$renderer, {});
	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Start upload`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}