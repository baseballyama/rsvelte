import * as $ from 'svelte/internal/server';
import { Center, Notification, Stack } from '@svelteuidev/core';
import { Check, Cross2 } from 'radix-icons-svelte';

const code = `
<script>
	import { Notification } from '@svelteuidev/core';
	import { Check, Cross2 } from 'radix-icons-svelte';
<\/script>

<Notification title='Default notification'>
    This is the default notification with title and body
</Notification>

<Notification title='Teal notification' icon={Check} color='teal'>
    This is the teal color notification with icon
</Notification>

<Notification icon={Cross2} color='red'>
    Oops, this notification has no title
</Notification>

<Notification title='Uploading data' loading withCloseButton={false}>
    Please wait while your data is being uploaded, you can't close this notification
</Notification>`;

export const type = 'demo';
export const configuration = { code };

export default function Notification_demo_usage($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Stack($$renderer, {
				position: 'center',
				children: ($$renderer) => {
					Notification($$renderer, {
						title: 'Default notification',
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is the default notification with title and body`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Notification($$renderer, {
						title: 'Teal notification',
						icon: Check,
						color: 'teal',
						children: ($$renderer) => {
							$$renderer.push(`<!---->This is the teal color notification with icon`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Notification($$renderer, {
						icon: Cross2,
						color: 'red',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Oops, this notification has no title`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Notification($$renderer, {
						title: 'Uploading data',
						loading: true,
						withCloseButton: false,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Please wait while your data is being uploaded, you can't close this notification`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}