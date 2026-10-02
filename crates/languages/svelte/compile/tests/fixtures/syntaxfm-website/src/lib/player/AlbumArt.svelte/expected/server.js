import * as $ from 'svelte/internal/server';
import { PUBLIC_URL } from '$env/static/public';
import Album from './Album.svelte';
import { player } from '$/state/player';

export default function AlbumArt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { is_link = false, show = null } = $$props;

		if (is_link && show) {
			$$renderer.push(`<!--[0--><a class="art-wrapper svelte-1l7jk1h"${$.attr('href', `https://${$.stringify(PUBLIC_URL)}/${$.stringify(show.number)}`)}>`);
			Album($$renderer, {});
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class('art-wrapper svelte-1l7jk1h', void 0, {
				'loading': $.store_get($$store_subs ??= {}, '$player', player).status === 'LOADING'
			})}>`);

			Album($$renderer, {});
			$$renderer.push(`<!----> `);

			if (!$.store_get($$store_subs ??= {}, '$player', player).initial_load) {
				$$renderer.push(`<!--[0--><!---->`);

				{
					$$renderer.push(`<div class="cd svelte-1l7jk1h">📀</div>`);
				}

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}