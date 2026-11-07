import * as $ from 'svelte/internal/server';
import { greet } from '../utils/helper';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name = 'World' } = $$props;
		const greeting = $.derived(() => greet(name));

		$$renderer.push(`<p>${$.escape(greeting())}</p>`);
	});
}