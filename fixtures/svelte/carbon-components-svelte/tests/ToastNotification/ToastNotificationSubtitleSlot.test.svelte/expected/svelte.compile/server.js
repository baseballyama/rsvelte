import * as $ from 'svelte/internal/server';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

export default function ToastNotificationSubtitleSlot_test($$renderer) {
	ToastNotification($$renderer, {
		$$slots: {
			subtitleChildren: ($$renderer) => {
				$$renderer.push(`<span slot="subtitleChildren">Slot subtitle</span>`);
			}
		}
	});
}