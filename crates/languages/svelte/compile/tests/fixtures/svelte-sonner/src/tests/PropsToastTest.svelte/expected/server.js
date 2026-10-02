import * as $ from 'svelte/internal/server';
import { Toaster, toast } from '$lib/index.js';

export default function PropsToastTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { cb, $$slots, $$events, ...toasterProps } = $$props;

		function onClick() {
			cb(toast);
		}

		Toaster($$renderer, $.spread_props([toasterProps]));
		$$renderer.push(`<!----> <button data-testid="trigger">Trigger</button>`);
	});
}