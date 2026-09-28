import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

var root = $.from_html(`<strong slot="titleChildren">Custom Title:</strong>`);
var root_1 = $.from_html(`<strong slot="subtitleChildren">Custom subtitle content.</strong>`);
var root_2 = $.from_html(`<strong slot="captionChildren">Custom caption content.</strong>`);

export default function ToastNotificationCustom_test($$anchor) {
	ToastNotification($$anchor, {
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

			captionChildren: ($$anchor, $$slotProps) => {
				var strong_2 = root_2();

				$.append($$anchor, strong_2);
			}
		}
	});
}