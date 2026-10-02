import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueueBasic($$renderer) {
	let queue;

	NotificationQueue($$renderer, {});
	$$renderer.push(`<!----> `);

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show success`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'tertiary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show error`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'tertiary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show info`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'tertiary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Show warning`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}