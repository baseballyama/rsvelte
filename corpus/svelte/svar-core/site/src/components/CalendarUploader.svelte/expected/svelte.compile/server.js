import * as $ from 'svelte/internal/server';
import { Calendar } from "@svar-ui/svelte-core";

export default function CalendarUploader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="column svelte-1cpnak4">`);
		Calendar($$renderer, { value: new Date(), buttons: false });
		$$renderer.push(`<!----> `);

		Calendar($$renderer, {
			value: new Date(),
			current: new Date(new Date() * 1 + 3600 * 1000 * 24 * 32)
		});

		$$renderer.push(`<!----></div>`);
	});
}