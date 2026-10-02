import * as $ from 'svelte/internal/server';
import { getPropertyDescriptor } from '../util.js';
import Entry from './Entry.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';

export default function PropertyList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, keys = [], item, path } = $$props;
		const paging = 50;
		let max = paging;
		let slicedKeys = $.derived(() => keys.length > max ? keys.slice(0, max) : keys);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(slicedKeys());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let key = each_array[index];
			const descriptor = getPropertyDescriptor(value, key);

			Entry($$renderer, {
				i: index,
				children: ($$renderer) => {
					if (item) {
						$$renderer.push('<!--[0-->');
						item($$renderer, { key, index, descriptor });
						$$renderer.push(`<!---->`);
					} else if (descriptor?.get || descriptor?.set) {
						$$renderer.push('<!--[1-->');
						GetterSetter($$renderer, { value, descriptor, key, path });
					} else {
						$$renderer.push('<!--[-1-->');
						Node($$renderer, { value: value?.[key], key, path });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> `);

		if (slicedKeys().length < keys.length) {
			$$renderer.push('<!--[0-->');

			NodeActionButton($$renderer, {
				style: 'margin-left: 2em; text-align: center; margin-bottom: 0.5em; width: calc(100% - 5em)',
				onclick: () => {
					max += paging;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(Math.abs(max - keys.length))} more`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}