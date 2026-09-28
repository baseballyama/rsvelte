import * as $ from 'svelte/internal/server';
import InlineNotification from "carbon-components-svelte/Notification/InlineNotification.svelte";

export default function InlineNotificationSubtitleSlot_test($$renderer) {
	InlineNotification($$renderer, {
		$$slots: {
			subtitleChildren: ($$renderer) => {
				$$renderer.push(`<span slot="subtitleChildren">Slot subtitle</span>`);
			}
		}
	});
}