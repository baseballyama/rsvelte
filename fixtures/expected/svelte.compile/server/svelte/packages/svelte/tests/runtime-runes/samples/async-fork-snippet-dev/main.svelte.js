import * as $ from 'svelte/internal/server';
import { fork } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let condition = false;
		let checked = false;
		const d = $.derived(() => ({ checked }));

		$$renderer.push(`<button>fork</button> `);

		if (condition) {
			$$renderer.push('<!--[0-->');

			function foo($$renderer, { checked }) {
				$$renderer.push(`<!---->${$.escape(checked)}`);
			}

			$$renderer.push(`<button>`);
			foo($$renderer, d());
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}