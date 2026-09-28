import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueuePersistent($$renderer) {
	let queue;

	NotificationQueue($$renderer, {});
	$$renderer.push(`<!----> `);

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add persistent`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add auto-dismiss`);
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