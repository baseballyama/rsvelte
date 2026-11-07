import * as $ from 'svelte/internal/server';
import { getAllProperties } from '../util.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import HtmlValue from './HTMLValue.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

export default function HTMLViewFull($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { htmlState } from '../util/mutation-observer.svelte.js'
		let {
			value,
			key = undefined,
			path,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let keys = $.derived(() => getAllProperties(value).filter((prop) => ![
			'__svelte_meta',
			'__className',
			'__attributes',
			'__styles',
			'__t'
		].includes(prop.toString())));

		{
			function valuePreview($$renderer) {
				$$renderer.push(`<!---->`);

				{
					HtmlValue($$renderer, { value });
				}

				$$renderer.push(`<!---->`);
			}

			Expandable($$renderer, $.spread_props([
				{ value, key, path },
				{ length: keys().length, keepPreviewOnExpand: false },
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

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

						$$renderer.push(`<!---->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}