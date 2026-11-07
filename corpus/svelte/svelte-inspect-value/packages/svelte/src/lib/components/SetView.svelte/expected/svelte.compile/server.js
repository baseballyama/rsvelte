import * as $ from 'svelte/internal/server';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function SetView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, type, path, $$slots, $$events, ...rest } = $$props;
		let entries = $.derived(() => [...value.entries()].map(([_, v]) => v));
		let keys = $.derived(() => [...entries().keys()]);

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					list: entries(),
					prefix: '{',
					postfix: '}',
					showKey: false,
					showPreview
				});
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{ length: entries().length },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, index }) {
								Node($$renderer, { path, key: index, value: entries()[key] });
							}

							PropertyList($$renderer, { value, keys: keys(), item, $$slots: { item: true } });
						}
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}