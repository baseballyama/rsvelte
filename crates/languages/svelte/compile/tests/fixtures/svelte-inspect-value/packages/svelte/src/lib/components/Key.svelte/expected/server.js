import * as $ from 'svelte/internal/server';
import { getPreviewLevel, setIsKey } from '../contexts.js';
import { useOptions } from '../options.svelte.js';
import { getType, stringify, stringifyPath } from '../util.js';
import Node from './Node.svelte';
import Type from './Type.svelte';
import Highlight from './Highlight.svelte';

export default function Key($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			key,
			path = [],
			delim = ':',
			prefix,
			disabled,
			onclick,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const options = useOptions();
		const keyTypes = ['string', 'number', 'symbol', 'quotedstring'];
		const simpleKeys = ['bigint', 'regexp'];
		const shouldBeQuoted = /[^A-zÀ-ú0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F_$]|[\\[\]`]/;
		const previewLevel = getPreviewLevel();

		let keyType = $.derived(() => {
			const t = getType(key);

			if (t === 'string') {
				if (key.match(shouldBeQuoted) || key === '') {
					return 'quotedstring';
				}

				return t;
			}

			return t;
		});

		let display = $.derived(() => {
			if (key != null) {
				if (keyType() === 'quotedstring') {
					return stringify(key, undefined, options.value.quotes);
				}

				return key.toString();
			}

			return key;
		});

		let shouldShow = $.derived(() => key === undefined ? previewLevel > 0 : true);

		function onerror(error) {
			throw new Error('Error in Key.svelte', { cause: error });
		}

		setIsKey();

		if (shouldShow()) {
			$$renderer.push(`<!--[0--><!--[-->`);

			{
				$$renderer.push(`<div class="key-and-delimiter svelte-1dp9xwx"><div${$.attributes(
					{
						'data-testid': 'key',
						class: $.clsx(['key-outer', disabled && 'disabled']),
						'aria-label': key?.toString(),
						title: stringifyPath(path),
						'data-search-ignore': previewLevel > 0 ? '' : undefined,
						...rest
					},
					'svelte-1dp9xwx'
				)}>`);

				if (prefix) {
					$$renderer.push(`<!--[0--><span class="prefix svelte-1dp9xwx">${$.escape(prefix)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (keyTypes.includes(keyType())) {
					$$renderer.push(`<!--[0--><span${$.attr_class($.clsx(['key', keyType(), disabled && 'disabled']), 'svelte-1dp9xwx')}>`);

					if (keyType() === 'quotedstring' && key !== '') {
						$$renderer.push(`<!--[0--><!--[-->`);

						const each_array = $.ensure_array_like(display());

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let char = each_array[i];

							if (char === ' ') {
								$$renderer.push(`<!--[0--><span class="whitespace svelte-1dp9xwx">⋅</span>`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(char)}`);
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					} else {
						$$renderer.push('<!--[-1-->');

						Highlight($$renderer, {
							value: display()?.toString() ?? '',
							fields: ['key', 'path'],
							alsoMatch: stringifyPath(path)
						});
					}

					$$renderer.push(`<!--]--></span>`);
				} else if (simpleKeys.includes(keyType())) {
					$$renderer.push('<!--[1-->');
					Node($$renderer, { value: key });
				} else {
					$$renderer.push('<!--[-1-->');
					Type($$renderer, { type: keyType(), force: true });
				}

				$$renderer.push(`<!--]--></div> `);

				if (delim) {
					$$renderer.push(`<!--[0--><span class="delim svelte-1dp9xwx">${$.escape(delim)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}