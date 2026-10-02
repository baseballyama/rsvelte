import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPreviewLevel } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import Highlight from './Highlight.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'type', 'force']);

export default function Type($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, ''),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();

	let display = $.derived(() => {
		switch (type()) {
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
				return type();
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

	let required = $.derived(() => ALWAYS_VISIBLE_TYPES.includes(type()));
	const previewLevel = getPreviewLevel();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => ['type', type(), previewLevel ?? 'preview']);

				Highlight($$anchor, $.spread_props(
					{
						get value() {
							return $.get(display);
						},
						fields: ['type'],
						get alsoMatch() {
							return type();
						},
						'data-testid': 'type',
						get class() {
							return $.get($0);
						},

						get title() {
							return type();
						}
					},
					() => rest
				));
			}
		};

		$.if(node, ($$render) => {
			if (type() && options.value.showTypes && previewLevel === 0 || $.get(required) || $$props.force) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}