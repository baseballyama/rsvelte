import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";
import NotificationActionButton from "carbon-components-svelte/Notification/NotificationActionButton.svelte";

var root = $.from_html(`<strong slot="titleChildren">Custom Title:</strong>`);
var root_1 = $.from_html(`<strong slot="subtitleChildren">Custom subtitle content.</strong>`);

export default function InlineNotificationCustom_test($$anchor) {
	InlineNotification($$anchor, {
		kind: 'warning',
		$$slots: {
			titleChildren: ($$anchor, $$slotProps) => {
				var strong = root();

				$.append($$anchor, strong);
			},

			subtitleChildren: ($$anchor, $$slotProps) => {
				var strong_1 = root_1();

				$.append($$anchor, strong_1);
			},

			actions: ($$anchor, $$slotProps) => {
				NotificationActionButton($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Learn more');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		}
	});
}