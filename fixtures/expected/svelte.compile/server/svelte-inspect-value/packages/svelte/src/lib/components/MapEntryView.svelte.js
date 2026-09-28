import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

export default function MapEntryView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			key = undefined,
			type,
			path = [],
			$$slots,
			$$events,
			...rest
		} = $$props;

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					keyValue: [[value[0], value[1]]],
					prefix: '{',
					postfix: '}',
					keyDelim: '=>',
					keyStyle: 'margin-right: 0.5em;',
					showPreview
				});
			}

			Expandable($$renderer, $.spread_props([
				{
					key,
					type: '',
					value,
					path,
					length: 2,
					showLength: false,
					keepPreviewOnExpand: true
				},
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						Entry($$renderer, {
							i: 0,
							children: ($$renderer) => {
								Node($$renderer, { key: 'key', value: value[0], path });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Entry($$renderer, {
							i: 1,
							children: ($$renderer) => {
								Node($$renderer, { key: 'value', value: value[1], path });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}