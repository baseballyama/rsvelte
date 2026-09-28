import * as $ from 'svelte/internal/server';
import { isArray, isObject } from '../util.js';
import { htmlState } from '../util/mutation-observer.svelte.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import HtmlValue from './HTMLValue.svelte';
import Node from './Node.svelte';
import PropertyList from './PropertyList.svelte';

export default function HTMLViewSimple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			key = undefined,
			path,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// svelte-ignore state_referenced_locally TODO
		let element = htmlState(value);

		let current = { scrollLeft: 0, scrollTop: 0, clientHeight: 0, clientWidth: 0 };

		let attrs = $.derived(() => {
			if (element.ele) {
				return Object.entries(element.ele.attributes ?? {}).map(([, attr]) => [attr.name, attr.value]).filter(([name]) => !['class', 'style', 'data'].includes(name) && !name.startsWith('data-'));
			}

			return [];
		});

		let styles = $.derived(() => {
			if (element.ele) {
				const elementStyle = element.ele.style;
				const out = [];

				for (const prop in elementStyle) {
					if (Object.hasOwn(elementStyle, prop) && !Number.isNaN(Number.parseInt(prop))) {
						const value = elementStyle.getPropertyValue(elementStyle[prop]);

						if (value) out.push([
							elementStyle[prop],
							elementStyle.getPropertyValue(elementStyle[prop])
						]);
					}
				}

				return out;
			}

			return [];
		});

		let entries = $.derived(() => Object.entries({
			...Object.fromEntries(attrs()),
			class: element.ele.className?.split(' ').filter(Boolean) ?? [],
			styles: Object.fromEntries(styles()),
			data: Object.fromEntries(Object.entries(element.ele.dataset ?? {})),
			...current,
			children: value.children,
			value: value.value
		}).filter(([, v]) => isArray(v)
			? v.length
			: isObject(v) ? Object.entries(v).length : v != null));

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
				{ length: entries().length, keepPreviewOnExpand: true },
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
								if ((key === 'children' || key === 'value') && (descriptor?.get || descriptor?.set)) {
									$$renderer.push('<!--[0-->');
									GetterSetter($$renderer, { value, descriptor, key, path });
								} else {
									$$renderer.push('<!--[-1-->');
									Node($$renderer, { value: entries().find((e) => e[0] === key)?.[1], key, path });
								}

								$$renderer.push(`<!--]-->`);
							}

							PropertyList($$renderer, {
								keys: entries().map((e) => e[0]),
								value,
								item,
								$$slots: { item: true }
							});
						}

						$$renderer.push(`<!---->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}