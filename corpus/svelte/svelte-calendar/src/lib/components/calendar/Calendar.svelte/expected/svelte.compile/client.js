import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DayPicker from '$lib/components/calendar/DayPicker.svelte';
import ViewTransitionEffect from '$lib/components/generic/ViewTransitionEffect.svelte';
import DatepickerControls from '$lib/components/calendar/CalendarControls.svelte';
import { getContext } from 'svelte';
import { storeContextKey } from '$lib/context';
import CrossfadeProvider from '$lib/components/generic/crossfade/CrossfadeProvider.svelte';
import MonthPicker from '$lib/components/calendar/MonthPicker.svelte';
import YearPicker from '$lib/components/calendar/YearPicker.svelte';

var root = $.from_html(`<div class="grid svelte-1402ryx"><!> <div class="contents svelte-1402ryx"><!></div></div>`);

export default function Calendar($$anchor, $$props) {
	$.push($$props, true);

	const $store = () => $.store_get(store, '$store', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const store = getContext(storeContextKey);

	CrossfadeProvider($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const key = $.derived(() => $$slotProps.key);
				const send = $.derived(() => $$slotProps.send);
				const receive = $.derived(() => $$slotProps.receive);
				var div = root();
				var node = $.child(div);

				DatepickerControls(node, {});

				var div_1 = $.sibling(node, 2);
				var node_1 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						ViewTransitionEffect($$anchor, {
							children: ($$anchor, $$slotProps) => {
								DayPicker($$anchor, {});
							},
							$$slots: { default: true }
						});
					};

					var consequent_1 = ($$anchor) => {
						ViewTransitionEffect($$anchor, {
							children: ($$anchor, $$slotProps) => {
								MonthPicker($$anchor, {});
							},
							$$slots: { default: true }
						});
					};

					var consequent_2 = ($$anchor) => {
						ViewTransitionEffect($$anchor, {
							children: ($$anchor, $$slotProps) => {
								YearPicker($$anchor, {});
							},
							$$slots: { default: true }
						});
					};

					$.if(node_1, ($$render) => {
						if ($store().activeView === 'days') $$render(consequent); else if ($store().activeView === 'months') $$render(consequent_1, 1); else if ($store().activeView === 'years') $$render(consequent_2, 2);
					});
				}

				$.reset(div_1);
				$.reset(div);
				$.transition(1, div, () => $.get(receive), () => ({ key: $.get(key) }));
				$.transition(2, div, () => $.get(send), () => ({ key: $.get(key) }));
				$.append($$anchor, div);
			}
		}
	});

	$.pop();
	$$cleanup();
}