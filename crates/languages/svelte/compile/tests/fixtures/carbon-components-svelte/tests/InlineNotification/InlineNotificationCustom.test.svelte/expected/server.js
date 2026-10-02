import * as $ from 'svelte/internal/server';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

export default function InlineNotificationCustom_test($$renderer) {
	InlineNotification($$renderer, {
		kind: 'warning',
		$$slots: {
			titleChildren: ($$renderer) => {
				$$renderer.push(`<strong slot="titleChildren">Custom Title:</strong>`);
			},

			subtitleChildren: ($$renderer) => {
				$$renderer.push(`<strong slot="subtitleChildren">Custom subtitle content.</strong>`);
			},

			actions: ($$renderer) => {
				{
					NotificationActionButton($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Learn more`);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});
}