import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

export default function URLSearchParamsView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = new URLSearchParams(),
			key = undefined,
			path,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let entries = $.derived(() => {
			let entries = {};

			for (const key of value.keys()) {
				if (!Object.hasOwn(entries, key)) {
					const all = value.getAll(key);

					if (all.length === 1) {
						entries[key] = all[0];
					} else {
						entries[key] = all;
					}
				}
			}

			return Object.entries(entries);
		});

		let preview = $.derived(() => entries().slice(0, 3));

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, { keyValue: preview(), prefix: '{', postfix: '}', showPreview });
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, path },
				{ length: value.size },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(entries());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let [key, value] = each_array[i];

							Entry($$renderer, {
								i,
								children: ($$renderer) => {
									Node($$renderer, { value, key, path });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}