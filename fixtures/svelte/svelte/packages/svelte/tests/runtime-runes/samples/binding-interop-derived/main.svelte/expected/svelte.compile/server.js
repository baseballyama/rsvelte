import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Comp from './Comp.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const myStore = writable('');

		{
			function children($$renderer, { props }) {
				$$renderer.select(
					{
						...props,
						value: $.store_get($$store_subs ??= {}, '$myStore', myStore)
					},
					($$renderer) => {
						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`A`);
						});

						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`B`);
						});

						$$renderer.option({}, ($$renderer) => {
							$$renderer.push(`C`);
						});
					}
				);
			}

			Comp($$renderer, { children, $$slots: { default: true } });
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}