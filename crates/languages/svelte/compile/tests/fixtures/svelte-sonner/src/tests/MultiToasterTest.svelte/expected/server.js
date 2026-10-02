import * as $ from 'svelte/internal/server';
import { Toaster, toast } from '$lib/index.js';

export default function MultiToasterTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { cb } = $$props;

		function onClick() {
			cb(toast);
		}

		$$renderer.push(`<div data-testid="default-toaster">`);
		Toaster($$renderer, {});
		$$renderer.push(`<!----></div> <div data-testid="named-toaster">`);
		Toaster($$renderer, { id: 'secondary', position: 'top-center' });
		$$renderer.push(`<!----></div> <button data-testid="trigger">Trigger</button>`);
	});
}