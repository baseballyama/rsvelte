import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';
import Expandable from './Expandable.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';

export default function TypedArrayView($$renderer, $$props) {
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

		const internalKeys = ['buffer', 'byteLength', 'byteOffset', 'length'];

		function getValue(key) {
			return value[key];
		}

		let entries = $.derived(() => internalKeys.map((k) => [k, getValue(k)]));
		let preview = $.derived(() => value.slice(0, 3));

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					prefix: '[',
					postfix: ']',
					list: preview(),
					showKey: false,
					showPreview
				});
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{ length: value.length },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(value);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let num = each_array[i];

							Entry($$renderer, {
								i,
								children: ($$renderer) => {
									Node($$renderer, { key: i, value: num, path });
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(entries());

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let [key, val] = each_array_1[i];

							Entry($$renderer, {
								i: value.length + i,
								children: ($$renderer) => {
									Node($$renderer, { key, value: val, path });
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