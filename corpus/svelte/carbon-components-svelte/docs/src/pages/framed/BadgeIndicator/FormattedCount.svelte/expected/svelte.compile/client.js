import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BadgeIndicator, Button, Stack } from "carbon-components-svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function FormattedCount($$anchor) {
	const notifications = 1200;
	const messages = 2_500_000;

	function formatCount(value) {
		return value.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
	}

	Stack($$anchor, {
		orientation: 'horizontal',
		gap: 7,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				kind: 'ghost',
				get icon() {
					return Notification;
				},
				iconDescription: 'Notifications',
				tooltipAlignment: 'start',
				$$slots: {
					badge: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => formatCount(notifications));

							BadgeIndicator($$anchor, {
								slot: 'badge',
								get count() {
									return $.get($0);
								}
							});
						}
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				kind: 'ghost',
				get icon() {
					return Notification;
				},
				iconDescription: 'Notifications',
				$$slots: {
					badge: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => formatCount(messages));

							BadgeIndicator($$anchor, {
								slot: 'badge',
								get count() {
									return $.get($0);
								}
							});
						}
					}
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				kind: 'ghost',
				get icon() {
					return Notification;
				},
				iconDescription: 'Notifications',
				$$slots: {
					badge: ($$anchor, $$slotProps) => {
						BadgeIndicator($$anchor, { slot: 'badge', count: '99+' });
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}