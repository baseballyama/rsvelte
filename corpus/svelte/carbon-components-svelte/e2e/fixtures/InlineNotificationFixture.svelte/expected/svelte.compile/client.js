import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InlineNotification } from "carbon-components-svelte";

export default function InlineNotificationFixture($$anchor) {
	let open = true;

	InlineNotification($$anchor, {
		'data-testid': 'inline-notification',
		kind: 'info',
		title: 'Notification title',
		subtitle: 'Notification subtitle',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		}
	});
}