import * as $ from 'svelte/internal/server';
import { get, has, has_unset } from './main.svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const message = get();

		$$renderer.push(`<h1>${$.escape(message)}</h1> `);

		if (has()) {
			$$renderer.push(`<!--[0--><h2>it's me</h2>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!has_unset()) {
			$$renderer.push(`<!--[0--><h2>or not</h2>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}