import * as $ from 'svelte/internal/server';
import { BadgeIndicator, Button, Stack } from "carbon-components-svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

export default function FormattedCount($$renderer) {
	const notifications = 1200;
	const messages = 2_500_000;

	function formatCount(value) {
		return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
	}

	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 7,
		children: ($$renderer) => {
			Button($$renderer, {
				kind: 'ghost',
				icon: Notification,
				iconDescription: 'Notifications',
				tooltipAlignment: 'start',
				$$slots: {
					badge: ($$renderer) => {
						BadgeIndicator($$renderer, { slot: 'badge', count: formatCount(notifications) });
					}
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'ghost',
				icon: Notification,
				iconDescription: 'Notifications',
				$$slots: {
					badge: ($$renderer) => {
						BadgeIndicator($$renderer, { slot: 'badge', count: formatCount(messages) });
					}
				}
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'ghost',
				icon: Notification,
				iconDescription: 'Notifications',
				$$slots: {
					badge: ($$renderer) => {
						BadgeIndicator($$renderer, { slot: 'badge', count: '99+' });
					}
				}
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}