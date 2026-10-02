import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Notification_demo_usage($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Notification(node, {
						title: 'Default notification',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('This is the default notification with title and body');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Notification(node_1, {
						title: 'Teal notification',
						get icon() {
							return Check;
						},
						color: 'teal',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('This is the teal color notification with icon');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Notification(node_2, {
						get icon() {
							return Cross2;
						},
						color: 'red',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Oops, this notification has no title');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Notification(node_3, {
						title: 'Uploading data',
						loading: true,
						withCloseButton: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Please wait while your data is being uploaded, you can\'t close this notification');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}