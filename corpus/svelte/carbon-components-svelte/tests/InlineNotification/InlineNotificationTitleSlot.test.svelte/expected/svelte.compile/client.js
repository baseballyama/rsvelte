import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";

var root = $.from_html(`<span slot="titleChildren">Slot title</span>`);

export default function InlineNotificationTitleSlot_test($$anchor, $$props) {
	InlineNotification($$anchor, {
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