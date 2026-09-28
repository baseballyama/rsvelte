import * as $ from 'svelte/internal/server';
import { useOptions } from '../options.svelte.js';
import { getAllProperties, isValidStore } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import ObjectView from './ObjectView.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function SvelteStoreView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			value,
			key = undefined,
			type,
			path = [],
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();

		let $$d = $.derived(() => options.value),
			storeMode = $.derived(() => $$d().stores);

		const valueKey = Symbol('store-value');
		let namedConstructor = $.derived(() => value.constructor.name !== 'Object' ? value.constructor.name : false);
		let storeType = $.derived(() => typeof value.set === 'function' ? 'writable' : 'readable');
		let valueType = $.derived(() => namedConstructor() ? namedConstructor() : storeType());
		let keys = $.derived(() => [valueKey, ...getAllProperties(value)]);
		let validStore = $.derived(() => isValidStore(value));

		if (validStore()) {
			$$renderer.push('<!--[0-->');

			if (storeMode() === 'full' || storeMode() === true) {
				$$renderer.push('<!--[0-->');

				{
					function valuePreview($$renderer, { showPreview }) {
						Preview($$renderer, {
							style: 'margin-left: -0.5em',
							showKey: false,
							singleValue: { value: $.store_get($$store_subs ??= {}, '$value', value) },
							prefix: '(',
							postfix: ')',
							startLevel: 0,
							bracketStyle: 'color: var(--_comment-color)',
							showPreview
						});
					}

					Expandable($$renderer, $.spread_props([
						{ type: valueType(), length: keys().length, key, path, value },
						rest,
						{
							valuePreview,
							children: ($$renderer) => {
								{
									function item($$renderer, { key, descriptor }) {
										if (descriptor?.get || descriptor?.set) {
											$$renderer.push('<!--[0-->');
											GetterSetter($$renderer, { value, descriptor, key, path });
										} else if (key === valueKey) {
											$$renderer.push('<!--[1-->');

											Node($$renderer, {
												key: 'value',
												keyPrefix: '$',
												keyStyle: '--_text-color: var(--_comment-color); gap: 0;',
												value: $.store_get($$store_subs ??= {}, '$value', value),
												path: [...path, Symbol('$')]
											});
										} else {
											$$renderer.push('<!--[-1-->');
											Node($$renderer, { value: value[key], key, path });
										}

										$$renderer.push(`<!--]-->`);
									}

									PropertyList($$renderer, { keys: keys(), value, type, item, $$slots: { item: true } });
								}
							},
							$$slots: { valuePreview: true, default: true }
						}
					]));
				}
			} else if (storeMode() === 'value-only') {
				$$renderer.push('<!--[1-->');

				Node($$renderer, $.spread_props([
					{
						key,
						path: path?.toSpliced(path.length - 1),
						value: $.store_get($$store_subs ??= {}, '$value', value)
					},
					rest,
					{
						note: {
							title: 'store',
							description: 'Value was retrieved by subscribing to a store'
						}
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			ObjectView($$renderer, $.spread_props([
				{
					note: {
						title: 'invalid store',
						description: 'Subscribe function did not return a valid subscriber.\nReverted to default object view.'
					},
					value,
					key,
					type: 'object',
					path
				},
				rest
			]));
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}