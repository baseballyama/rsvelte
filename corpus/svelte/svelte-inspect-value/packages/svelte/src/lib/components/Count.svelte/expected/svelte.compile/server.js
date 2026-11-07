import * as $ from 'svelte/internal/server';
import Highlight from './Highlight.svelte';

export default function Count($$renderer, $$props) {
	let { length, type } = $$props;

	let prefix = $.derived(() => {
		switch (type) {
			case 'urlsearchparams':
				return 'size:';

			default:
				return '';
		}
	});

	let unit = $.derived(() => {
		switch (type) {
			case undefined:
				return;

			case 'urlsearchparams':
				return;

			case 'array':

			case 'int8array':

			case 'uint8array':

			case 'uint8clampedarray':

			case 'int16array':

			case 'uint16array':

			case 'int32array':

			case 'uint32array':

			case 'float32array':

			case 'float64array':

			case 'bigint64array':

			case 'biguint64array':
				return 'items';

			case 'string':
				return 'chars';

			default:
				return 'entries';
		}
	});

	if (typeof length === 'number') {
		$$renderer.push(`<!--[0--><div data-testid="count" class="count svelte-qm7g4h">`);

		if (length > 0) {
			$$renderer.push('<!--[0-->');

			if (prefix()) {
				$$renderer.push(`<!--[0--><span class="unit">${$.escape(prefix())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span>${$.escape(length)}</span> `);

			if (unit()) {
				$$renderer.push('<!--[0-->');
				Highlight($$renderer, { class: 'unit', value: unit(), fields: ['value'] });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
			Highlight($$renderer, { value: 'empty', fields: ['value'] });
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}