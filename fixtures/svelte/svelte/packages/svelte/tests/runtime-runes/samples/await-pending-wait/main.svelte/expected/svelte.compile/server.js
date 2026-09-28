import * as $ from 'svelte/internal/server';
import Await from './await.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let promise = void 0;

		$$renderer.push(`<button>Clear</button> <button>Immediate</button> <button>Takes time</button> `);

		if (promise) {
			$$renderer.push('<!--[0-->');
			Await($$renderer, { promise });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}