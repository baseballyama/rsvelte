import * as $ from 'svelte/internal/server';
import { Toaster, toast } from '$lib/index.js';

export default function ToastTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { cb } = $$props;

		function onClick() {
			cb(toast);
		}

		Toaster($$renderer, {});
		$$renderer.push(`<!----> <button data-testid="trigger">Trigger</button>`);
	});
}