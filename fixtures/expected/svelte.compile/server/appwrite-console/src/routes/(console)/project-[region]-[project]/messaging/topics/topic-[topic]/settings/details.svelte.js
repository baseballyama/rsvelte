import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { toLocaleDateTime } from '$lib/helpers/date';
import { topic, topicTotal } from '../store';

export default function Details($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		CardGrid($$renderer, {
			$$slots: {
				title: ($$renderer) => {
					{
						$$renderer.push(`Details`);
					}
				},

				aside: ($$renderer) => {
					{
						$$renderer.push(`<div class="u-flex u-main-space-between"><div data-private=""><p class="title">${$.escape($.store_get($$store_subs ??= {}, '$topicTotal', topicTotal))} subscriber${$.escape($.store_get($$store_subs ??= {}, '$topicTotal', topicTotal) === 1 ? '' : 's')}</p> <p>Created: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$topic', topic).$createdAt))}</p></div></div>`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}