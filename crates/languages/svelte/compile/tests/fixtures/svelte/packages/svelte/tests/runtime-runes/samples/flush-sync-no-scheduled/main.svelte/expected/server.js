import * as $ from 'svelte/internal/server';
import { flushSync } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let flag = true;
		let test = true;

		$$renderer.push(`<button>switch</button> <main><div>${$.escape(flag)}</div> `);

		if (!flag) {
			$$renderer.push(`<!--[0--><div>${$.escape(test)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></main>`);
	});
}