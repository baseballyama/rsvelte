import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show_count_1 = true;
		let count_1 = 0;
		let count_2 = 0;
		const count = $.derived(() => show_count_1 ? count_1 : count_2);

		if (count()) {
			$$renderer.push('<!--[0-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button>fork toggle</button> <button>toggle</button> <button>increment count 1</button> <button>increment count 2</button> <p>${$.escape(count())}</p>`);
	});
}