import * as $ from 'svelte/internal/server';
import { BROWSER } from 'esm-env';
import { getPreviewLevel } from '../contexts.js';
import Expandable from './Expandable.svelte';
import FunctionBody from './FunctionBody.svelte';

export default function FunctionView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, key, type, path, $$slots, $$events, ...rest } = $$props;
		let isMultiLine = $.derived(() => value.toString().includes('\n'));
		const previewLevel = getPreviewLevel();

		const oneLine = $.derived(() => {
			switch (type) {
				case 'asyncfunction':
					return value.toString().replace('async', '');

				case 'generatorfunction':
					return value.toString().replace('function*', '').replace('*', '');

				case 'asyncgeneratorfunction':
					return value.toString().replace('async', '').replace('function*', '').replace('*', '');
			}

			return value.toString();
		});

		{
			function valuePreview($$renderer, { showPreview }) {
				if (previewLevel) {
					$$renderer.push(`<!--[0--><span${$.attr('title', value.name)} class="preview value function svelte-fxbdh5">${$.escape(value.name)}</span>`);
				} else if (showPreview && isMultiLine() && BROWSER) {
					$$renderer.push('<!--[1-->');
					FunctionBody($$renderer, { value: oneLine(), inline: true });
				} else if (BROWSER && !isMultiLine()) {
					$$renderer.push('<!--[2-->');
					FunctionBody($$renderer, { value: oneLine(), inline: true });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Expandable($$renderer, $.spread_props([
				{
					key,
					type,
					path,
					value,
					length: isMultiLine() ? 1 : 0,
					showLength: false
				},
				rest,
				{
					valuePreview,
					children: ($$renderer) => {
						if (isMultiLine()) {
							$$renderer.push('<!--[0-->');
							FunctionBody($$renderer, { value: value.toString() });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { valuePreview: true, default: true }
				}
			]));
		}
	});
}