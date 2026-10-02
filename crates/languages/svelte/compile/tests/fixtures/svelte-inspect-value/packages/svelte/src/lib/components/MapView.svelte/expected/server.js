import * as $ from 'svelte/internal/server';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function MapView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, type, path = [], $$slots, $$events, ...rest } = $$props;
		let keys = $.derived(() => [...value.keys()]);
		let entries = $.derived(() => [...value.entries()]);

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					keyValue: entries(),
					prefix: '{',
					postfix: '}',
					keyDelim: '=>',
					keyStyle: 'margin-right: 0.5em;',
					showPreview
				});
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path, length: entries().length },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, index }) {
								Node($$renderer, {
									forceView: 'mapentry',
									path,
									key: index,
									value: [key, value.get(key)]
								});
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