import * as $ from 'svelte/internal/server';
import DayPicker from '$lib/components/calendar/DayPicker.svelte';
import ViewTransitionEffect from '$lib/components/generic/ViewTransitionEffect.svelte';
import DatepickerControls from '$lib/components/calendar/CalendarControls.svelte';
import { getContext } from 'svelte';
import { storeContextKey } from '$lib/context';
import CrossfadeProvider from '$lib/components/generic/crossfade/CrossfadeProvider.svelte';
import MonthPicker from '$lib/components/calendar/MonthPicker.svelte';
import YearPicker from '$lib/components/calendar/YearPicker.svelte';

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const store = getContext(storeContextKey);

		CrossfadeProvider($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { key, send, receive }) => {
					$$renderer.push(`<div class="grid svelte-1402ryx">`);
					DatepickerControls($$renderer, {});
					$$renderer.push(`<!----> <div class="contents svelte-1402ryx">`);

					if ($.store_get($$store_subs ??= {}, '$store', store).activeView === 'days') {
						$$renderer.push('<!--[0-->');

						ViewTransitionEffect($$renderer, {
							children: ($$renderer) => {
								DayPicker($$renderer, {});
							},
							$$slots: { default: true }
						});
					} else if ($.store_get($$store_subs ??= {}, '$store', store).activeView === 'months') {
						$$renderer.push('<!--[1-->');

						ViewTransitionEffect($$renderer, {
							children: ($$renderer) => {
								MonthPicker($$renderer, {});
							},
							$$slots: { default: true }
						});
					} else if ($.store_get($$store_subs ??= {}, '$store', store).activeView === 'years') {
						$$renderer.push('<!--[2-->');

						ViewTransitionEffect($$renderer, {
							children: ($$renderer) => {
								YearPicker($$renderer, {});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}