import * as $ from 'svelte/internal/server';
import { InlineCalendar } from '../../index';
import dayjs from 'dayjs';

export default function Store($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const theme = {
			calendar: { width: '600px', shadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }
		};

		let store;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			InlineCalendar($$renderer, {
				theme,
				get store() {
					return store;
				},

				set store($$value) {
					store = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid svelte-1l69wo8"><button class="svelte-1l69wo8">-1y</button> <button class="svelte-1l69wo8">-1m</button> <button class="day svelte-1l69wo8">-1d</button> <p>${$.escape(dayjs($.store_get($$store_subs ??= {}, '$store', store)?.selected).format('MM/DD/YYYY'))}</p> <button class="day svelte-1l69wo8">+1d</button> <button class="svelte-1l69wo8">+1m</button> <button class="svelte-1l69wo8">+1y</button></div> <p>You can access both the store's state and methods.</p>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}