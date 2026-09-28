import * as $ from 'svelte/internal/server';
import { greet } from './greet.js';

export default function Welcome($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { host = 'SvelteKit', guest = 'Vitest' } = $$props;

		$$renderer.push(`<h1>${$.escape(greet(host))}</h1> <p>${$.escape(greet(guest))}</p>`);
	});
}