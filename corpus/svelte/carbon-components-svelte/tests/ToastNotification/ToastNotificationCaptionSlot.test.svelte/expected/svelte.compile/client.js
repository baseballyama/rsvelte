import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

var root = $.from_html(`<span slot="captionChildren">Slot caption</span>`);

export default function ToastNotificationCaptionSlot_test($$anchor, $$props) {
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
			captionChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}