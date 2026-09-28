import * as $ from 'svelte/internal/server';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Highlight from './Highlight.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

export default function RegexpView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			key = undefined,
			type,
			path,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let keys = [
			'lastIndex',
			'dotAll',
			'flags',
			'global',
			'hasIndices',
			'ignoreCase',
			'multiline',
			'source',
			'sticky',
			'unicode',
			'unicodeSets'
		];

		{
			function valuePreview($$renderer) {
				Highlight($$renderer, {
					'data-testid': 'value',
					class: 'value regexp',
					title: value.toString(),
					value: value.toString(),
					fields: ['value']
				});
			}

			Expandable($$renderer, $.spread_props([
				{ length: 1, showLength: false, type, key, path, value },
				rest,
				{
					keepPreviewOnExpand: true,
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, descriptor }) {
								if (descriptor?.get || descriptor?.set) {
									$$renderer.push('<!--[0-->');
									GetterSetter($$renderer, { value, descriptor, key, path });
								} else {
									$$renderer.push('<!--[-1-->');
									Node($$renderer, { value: value[key], key, path });
								}

								$$renderer.push(`<!--]-->`);
							}

							PropertyList($$renderer, { keys, value, type, item, $$slots: { item: true } });
						}
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}