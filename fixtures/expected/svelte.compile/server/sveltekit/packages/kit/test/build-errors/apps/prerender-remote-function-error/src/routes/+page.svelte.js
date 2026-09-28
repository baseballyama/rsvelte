import * as $ from 'svelte/internal/server';
import { throws } from './data.remote.ts';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.await($$renderer, throws(), () => {}, (value) => {
			$$renderer.push(`${$.escape(value)}`);
		});

		$$renderer.push(`<!--]-->`);
	});
}