import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Main($$renderer) {
	let fetching = false;
	let shown = true;

	$$renderer.push(`<button>toggle</button> <button>fetch</button> `);

	if (fetching) {
		$$renderer.push(`<!--[0--><p>loading</p>`);
	} else {
		$$renderer.push(`<!--[-1--><div>`);

		if (shown) {
			$$renderer.push(`<!--[0--><div class="red">red</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]-->`);
}