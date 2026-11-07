import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

export default function InlineNotificationActionHref_test($$anchor) {
	InlineNotification($$anchor, {
		kind: 'info',
		title: 'New features available:',
		subtitle: 'Check out what\'s new.',
		$$slots: {
			actions: ($$anchor, $$slotProps) => {
				NotificationActionButton($$anchor, {
					href: 'https://example.com/releases',
					target: '_blank',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('View release notes');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}