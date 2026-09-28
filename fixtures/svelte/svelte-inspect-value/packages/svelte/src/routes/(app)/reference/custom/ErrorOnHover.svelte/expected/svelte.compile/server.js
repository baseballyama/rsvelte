import * as $ from 'svelte/internal/server';
import { CustomLine } from '$lib/index.js';

export default function ErrorOnHover($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, $$slots, $$events, ...rest } = $$props;
		let doAnError = false;

		CustomLine($$renderer, $.spread_props([
			{ value },
			rest,
			{
				children: ($$renderer) => {
					$$renderer.push(`<span>${$.escape(value)}</span> `);

					if (doAnError) {
						$$renderer.push(`<!--[0-->err ${$.escape(value.doesNotExist.doesNotExist)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}