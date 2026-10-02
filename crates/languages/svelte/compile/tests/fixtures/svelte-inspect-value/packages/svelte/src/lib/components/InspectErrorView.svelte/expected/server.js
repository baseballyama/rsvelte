import * as $ from 'svelte/internal/server';
import { getContext, setContext } from 'svelte';
import { InspectError } from '../types.js';
import Expandable from './Expandable.svelte';
import GetterSetter from './GetterSetter.svelte';
import Node from './Node.svelte';
import NodeActionButton from './NodeActionButton.svelte';
import PropertyList from './PropertyList.svelte';
import StringValue from './StringValue.svelte';

export default function InspectErrorView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = new InspectError(''),
			key,
			type = 'InspectError',
			path,
			keyPrefix,
			reset
		} = $$props;

		setContext(Symbol.for('siv.use-defaults'), true);

		const depth = getContext(Symbol.for('siv.error-depth')) ?? 0;

		setContext(Symbol.for('siv.error-depth'), depth + 1);

		if (depth <= 3) {
			$$renderer.push('<!--[0-->');

			{
				function valuePreview($$renderer) {
					NodeActionButton($$renderer, {
						onclick: reset,
						children: ($$renderer) => {
							$$renderer.push(`<!---->RESET`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					StringValue($$renderer, { type: 'error', value: value.message });
					$$renderer.push(`<!---->`);
				}

				Expandable($$renderer, {
					value,
					key,
					keyPrefix,
					path,
					type,
					length: 4,
					showLength: false,
					keepPreviewOnExpand: true,
					valuePreview,
					children: ($$renderer) => {
						{
							function item($$renderer, { key, descriptor }) {
								if (descriptor?.get || descriptor?.set) {
									$$renderer.push('<!--[0-->');
									GetterSetter($$renderer, { value, descriptor, key, path, usedefaults: true });
								} else {
									$$renderer.push('<!--[-1-->');
									Node($$renderer, { value: value[key], key, path, usedefaults: true });
								}

								$$renderer.push(`<!--]-->`);
							}

							PropertyList($$renderer, {
								value,
								keys: ['message', 'value', 'cause', 'stack'],
								item,
								$$slots: { item: true }
							});
						}
					},
					$$slots: { valuePreview: true, default: true }
				});
			}
		} else {
			$$renderer.push(`<!--[-1-->max error depth exceeded`);
		}

		$$renderer.push(`<!--]-->`);
	});
}