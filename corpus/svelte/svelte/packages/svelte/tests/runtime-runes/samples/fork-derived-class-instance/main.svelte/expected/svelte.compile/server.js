import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Counter {
			count = 0;
		}

		let condition = false;
		let counter = $.derived(() => new Counter());

		$$renderer.push(`<button>fork</button> `);

		if (condition) {
			$$renderer.push(`<!--[0--><button>click</button> <p>${$.escape(counter().count)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}