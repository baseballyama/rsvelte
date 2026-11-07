import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToastNotification } from "carbon-components-svelte";

export default function ToastNotificationFixture($$anchor) {
	let open = true;

	ToastNotification($$anchor, {
		'data-testid': 'toast-notification',
		kind: 'success',
		title: 'Toast title',
		subtitle: 'Toast subtitle',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		}
	});
}