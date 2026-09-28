import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, NotificationQueue } from "carbon-components-svelte";

export default function NotificationQueuePosition($$renderer) {
	let topRightQueue;
	let topCenterQueue;
	let topLeftQueue;
	let bottomRightQueue;
	let bottomCenterQueue;
	let bottomLeftQueue;

	NotificationQueue($$renderer, { position: 'top-right' });
	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: 'top-center' });
	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: 'top-left' });
	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: 'bottom-right' });
	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: 'bottom-center' });
	$$renderer.push(`<!----> `);
	NotificationQueue($$renderer, { position: 'bottom-left' });
	$$renderer.push(`<!----> `);

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add top left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add top center`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add top right`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <br/> `);

	ButtonSet($$renderer, {
		children: ($$renderer) => {
			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add bottom left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add bottom center`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add bottom right`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}