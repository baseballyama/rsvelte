import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

var root = $.from_html(`<span slot="titleChildren">Slot title</span>`);

export default function ToastNotificationTitleSlot_test($$anchor, $$props) {
	ToastNotification($$anchor, {
		$$events: {
			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			click: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},
		$$slots: {
			titleChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}