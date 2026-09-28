import * as $ from 'svelte/internal/server';
import { InlineNotification } from "carbon-components-svelte";

export default function InlineNotificationFixture($$renderer) {
	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		InlineNotification($$renderer, {
			'data-testid': 'inline-notification',
			kind: 'info',
			title: 'Notification title',
			subtitle: 'Notification subtitle',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}