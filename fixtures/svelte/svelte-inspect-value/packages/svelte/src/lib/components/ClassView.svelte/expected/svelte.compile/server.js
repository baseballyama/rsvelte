import * as $ from 'svelte/internal/server';
import { getPreviewLevel } from '../contexts.js';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function ClassView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
		let { value, key, type, path, $$slots, $$events, ...rest } = $$props;

		const previewLevel = getPreviewLevel();
		const nonStatic = ['name', 'length', 'prototype'];
		let keys = $.derived(() => getAllProperties(value));

		{
			function valuePreview($$renderer, { showPreview }) {
				$$renderer.push(`<span${$.attr_class(`value ${$.stringify(type)}`)}>${$.escape(value.name)}</span> `);

				if (!previewLevel) {
					$$renderer.push('<!--[0-->');
					Preview($$renderer, { prefix: '{', postfix: '}', keys: keys(), value, showPreview });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, type, path },
				{ length: keys().length },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, descriptor }) {
								if (descriptor?.get || descriptor?.set) {
									$$renderer.push('<!--[0-->');

									GetterSetter($$renderer, {
										keyPrefix: nonStatic.includes(key) ? '' : 'static',
										key,
										value,
										descriptor,
										path
									});
								} else {
									$$renderer.push('<!--[-1-->');

									Node($$renderer, {
										keyPrefix: nonStatic.includes(key) ? '' : 'static',
										key,
										value: value[key],
										path
									});
								}

								$$renderer.push(`<!--]-->`);
							}

							PropertyList($$renderer, { keys: keys(), value, item, $$slots: { item: true } });
						}
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}