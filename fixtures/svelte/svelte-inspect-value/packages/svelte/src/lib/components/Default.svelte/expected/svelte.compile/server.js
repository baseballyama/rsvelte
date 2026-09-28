import * as $ from 'svelte/internal/server';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import OneLineView from './OneLineView.svelte';
import Preview from './Preview.svelte';
import PropertyList from './PropertyList.svelte';

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, path, $$slots, $$events, ...rest } = $$props;
		let keys = $.derived(() => getAllProperties(value));

		if (keys().length) {
			$$renderer.push('<!--[0-->');

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
					{ length: keys().length, key, path, value },
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
										Node($$renderer, { value: value[key], key, path });
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
		} else {
			$$renderer.push('<!--[-1-->');
			OneLineView($$renderer, $.spread_props([{ key, path, value }, rest]));
		}

		$$renderer.push(`<!--]-->`);
	});
}