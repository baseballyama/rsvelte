import * as $ from 'svelte/internal/server';
import { enhancedialog } from './enhance-dialog';

export default function ConfirmationModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, title, description } = $$props;
		let dialog;

		function checkAndResolve() {
			// when dialog has closed and animation has finished, resolve
			if (!dialog.open) {
				item.resolve({ confirmed: dialog.returnValue === 'yes' });
			}
		}

		$$renderer.push(`<dialog class="bg-bg-200 text-fg backdrop:bg-bg space-y-4 p-8 shadow-lg backdrop:opacity-50 svelte-f6tcn3"><p class="text-xl font-medium">${$.escape(title)}</p> <p>${$.escape(description)}</p> <form method="dialog" class="flex justify-end gap-4"><button type="submit" class="c-btn c-btn--outlined" value="no">No</button> <button type="submit" class="c-btn" value="yes">Yes</button></form></dialog>`);
	});
}