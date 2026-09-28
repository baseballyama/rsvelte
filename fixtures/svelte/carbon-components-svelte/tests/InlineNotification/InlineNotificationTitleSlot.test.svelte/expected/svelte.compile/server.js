import * as $ from 'svelte/internal/server';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";

export default function InlineNotificationTitleSlot_test($$renderer) {
	InlineNotification($$renderer, {
		$$slots: {
			titleChildren: ($$renderer) => {
				$$renderer.push(`<span slot="titleChildren">Slot title</span>`);
			}
		}
	});
}