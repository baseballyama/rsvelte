import * as $ from 'svelte/internal/server';
import { enumerateObject } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function ObjectView($$renderer, $$props) {
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

		let namedConstructor = $.derived(() => value?.constructor?.name !== 'Object' ? value?.constructor?.name : false);
		let objectType = $.derived(() => namedConstructor() ? namedConstructor() : type);
		let properties = $.derived(() => enumerateObject(value));

		let keys = $.derived(() => [
			...properties(),
			namedConstructor() ? 'constructor' : undefined
		].filter((v) => v != null));

		{
			function valuePreview($$renderer, { showPreview }) {
				Preview($$renderer, {
					prefix: '{',
					postfix: '}',
					value,
					path,
					keys: keys(),
					showPreview
				});
			}

			Expandable($$renderer, $.spread_props([
				{
					type: objectType(),
					length: keys().length,
					key,
					path,
					value,
					forceType: !!namedConstructor()
				},
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, descriptor }) {
								if (descriptor?.get || descriptor?.set) {
									$$renderer.push('<!--[0-->');
									GetterSetter($$renderer, { value, descriptor, key, path });
								} else {
									$$renderer.push('<!--[-1-->');
									Node($$renderer, { value: value?.[key], key, path });
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
	});
}