import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { n = 0 } = $$props;
		let i = 0;

		function logRender(i) {
			console.log(`render ${i}`);
		}

		$$renderer.push(`<p>${$.escape(logRender(`n${n}`))}</p> <p>${$.escape(logRender(`i${i}`))}</p>`);
	});
}