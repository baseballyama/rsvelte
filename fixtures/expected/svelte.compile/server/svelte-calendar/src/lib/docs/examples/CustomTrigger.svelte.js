import * as $ from 'svelte/internal/server';
import dayjs from 'dayjs';
import { Datepicker } from '../../index';

export default function CustomTrigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let store;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Datepicker($$renderer, {
				get store() {
					return store;
				},

				set store($$value) {
					store = $$value;
					$$settled = false;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { key, send, receive }) => {
						$$renderer.push(`<button class="svelte-wm2vmo">`);

						if ($.store_get($$store_subs ??= {}, '$store', store)?.hasChosen) {
							$$renderer.push(`<!--[0-->${$.escape(dayjs($.store_get($$store_subs ??= {}, '$store', store).selected).format('ddd MMM D, YYYY'))}`);
						} else {
							$$renderer.push(`<!--[-1-->Pick a Date`);
						}

						$$renderer.push(`<!--]--></button>`);
					}
				}
			});
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