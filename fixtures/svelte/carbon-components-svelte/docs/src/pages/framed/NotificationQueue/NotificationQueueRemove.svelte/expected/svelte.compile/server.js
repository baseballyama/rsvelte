import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueRemove($$renderer) {
	let queue;
	let notificationIds = [];

	NotificationQueue($$renderer, {});
	$$renderer.push(`<!----> `);

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add notification`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Remove last`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clear all`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}