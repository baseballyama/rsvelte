import * as $ from 'svelte/internal/server';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

export default function ToastNotificationCaptionSlot_test($$renderer) {
	ToastNotification($$renderer, {
		$$slots: {
			captionChildren: ($$renderer) => {
				$$renderer.push(`<span slot="captionChildren">Slot caption</span>`);
			}
		}
	});
}