import * as $ from 'svelte/internal/server';
import { getPreviewLevel } from '../contexts.js';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function ArrayView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value: array = [],
			path,
			type,
			showKey,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const previewLevel = getPreviewLevel();

		let otherprops = $.derived(() => getAllProperties(array).filter((prop) => {
			if (typeof prop === 'string') {
				return (/\d+/).test(prop) === false && prop !== 'length';
			}

			return true;
		}));

		let keys = $.derived(() => [...array.keys(), ...otherprops()]);

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					path,
					list: array,
					prefix: '[',
					postfix: ']',
					showPreview,
					showKey: false
				});
			}

			Expandable($$renderer, $.spread_props([
				{
					value: array,
					length: array.length,
					type,
					path,
					showKey: showKey && previewLevel === 0
				},
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key }) {
								Node($$renderer, { value: array?.[key], key, path });
							}

							PropertyList($$renderer, {
								value: array,
								type,
								keys: keys(),
								item,
								$$slots: { item: true }
							});
						}
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}