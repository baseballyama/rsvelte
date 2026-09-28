import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';
import A from './A.svelte';
import B from './B.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = true;
		let f;

		$$renderer.push(`<button>fork</button> <button>commit</button> `);

		if (open) {
			$$renderer.push('<!--[0-->');
			A($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			B($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}