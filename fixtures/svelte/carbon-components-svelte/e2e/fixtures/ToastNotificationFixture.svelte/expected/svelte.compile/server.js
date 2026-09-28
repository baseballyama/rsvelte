import * as $ from 'svelte/internal/server';
import { ToastNotification } from "carbon-components-svelte";

export default function ToastNotificationFixture($$renderer) {
	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ToastNotification($$renderer, {
			'data-testid': 'toast-notification',
			kind: 'success',
			title: 'Toast title',
			subtitle: 'Toast subtitle',
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