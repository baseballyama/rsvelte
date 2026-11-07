import * as $ from 'svelte/internal/server';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

export default function InlineNotificationActionHref_test($$renderer) {
	InlineNotification($$renderer, {
		kind: 'info',
		title: 'New features available:',
		subtitle: 'Check out what\'s new.',
		$$slots: {
			actions: ($$renderer) => {
				{
					NotificationActionButton($$renderer, {
						href: 'https://example.com/releases',
						target: '_blank',
						children: ($$renderer) => {
							$$renderer.push(`<!---->View release notes`);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});
}