import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = false;
		let animate = false;

		function maybe(node, animate) {
			if (animate) return fade(node);
		}

		$$renderer.push(`<button>show</button><button>animate</button> `);

		if (show) {
			$$renderer.push(`<!--[0--><h1>Hello ${$.escape(name)}!</h1>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}