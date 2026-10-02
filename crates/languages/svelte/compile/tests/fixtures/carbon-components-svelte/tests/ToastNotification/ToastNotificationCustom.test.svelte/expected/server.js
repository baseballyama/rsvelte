import * as $ from 'svelte/internal/server';
import ToastNotification from "carbon-components-svelte/Notification/ToastNotification.svelte";

export default function ToastNotificationCustom_test($$renderer) {
	ToastNotification($$renderer, {
		kind: 'warning',
		$$slots: {
			titleChildren: ($$renderer) => {
				$$renderer.push(`<strong slot="titleChildren">Custom Title:</strong>`);
			},

			subtitleChildren: ($$renderer) => {
				$$renderer.push(`<strong slot="subtitleChildren">Custom subtitle content.</strong>`);
			},

			captionChildren: ($$renderer) => {
				$$renderer.push(`<strong slot="captionChildren">Custom caption content.</strong>`);
			}
		}
	});
}