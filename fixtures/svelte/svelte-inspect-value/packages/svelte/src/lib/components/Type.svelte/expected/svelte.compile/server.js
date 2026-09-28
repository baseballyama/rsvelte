import * as $ from 'svelte/internal/server';
import { getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import Highlight from './Highlight.svelte';

export default function Type($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { type = '', force, $$slots, $$events, ...rest } = $$props;
		const options = useOptions();

		let display = $.derived(() => {
			switch (type) {
				case 'number':
					return 'num';

				case 'string':
					return 'str';

				case 'regexp':
					return 'regex';

				case 'function':
					return 'fn';

				case 'asyncfunction':
					return 'async fn';

				case 'generatorfunction':
					return 'fn*';

				case 'asyncgeneratorfunction':
					return 'async fn*';

				case 'boolean':
					return 'bool';

				case 'url':
					return 'URL';

				case 'urlsearchparams':
					return 'URLSearch';

				case 'map':
					return 'Map';

				case 'set':
					return 'Set';

				case 'date':
					return 'Date';

				case 'object':
					return 'obj';

				case 'array':
					return 'arr';

				case 'promise':
					return 'Promise';

				default:
					return type;
			}
		});

		const ALWAYS_VISIBLE_TYPES = [
			'undefined',
			'null',
			'class',
			'function',
			'asyncfunction',
			'generatorfunction',
			'asyncgeneratorfunction',
			'promise',
			'readable',
			'writable',
			'Entry',
			'map',
			'set',
			'date',
			'url'
		];

		let required = $.derived(() => ALWAYS_VISIBLE_TYPES.includes(type));
		const previewLevel = getPreviewLevel();

		if (type && options.value.showTypes && previewLevel === 0 || required() || force) {
			$$renderer.push('<!--[0-->');

			Highlight($$renderer, $.spread_props([
				{
					value: display(),
					fields: ['type'],
					alsoMatch: type,
					'data-testid': 'type',
					class: ['type', type, previewLevel ?? 'preview'],
					title: type
				},
				rest
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}