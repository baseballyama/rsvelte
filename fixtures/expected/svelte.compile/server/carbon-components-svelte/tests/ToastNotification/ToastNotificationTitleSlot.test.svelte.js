import * as $ from 'svelte/internal/server';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

export default function ToastNotificationTitleSlot_test($$renderer) {
	ToastNotification($$renderer, {
		$$slots: {
			titleChildren: ($$renderer) => {
				$$renderer.push(`<span slot="titleChildren">Slot title</span>`);
			}
		}
	});
}