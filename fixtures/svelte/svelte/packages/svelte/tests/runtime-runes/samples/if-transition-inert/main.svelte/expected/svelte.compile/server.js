import * as $ from 'svelte/internal/server';
import { fade } from "svelte/transition";

export default function Main($$renderer) {
	let state = "hello";

	$$renderer.push(`<button>hide</button> `);

	if (state) {
		$$renderer.push(`<!--[0--><div>`);

		if (true) {
			$$renderer.push(`<!--[0-->${$.escape(state)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}