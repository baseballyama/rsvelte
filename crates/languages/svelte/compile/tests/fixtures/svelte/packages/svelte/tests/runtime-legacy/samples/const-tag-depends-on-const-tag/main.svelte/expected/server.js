import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let message = 'hello';

		$$renderer.push(`<input${$.attr('value', message)}/> `);

		if (true) {
			$$renderer.push('<!--[0-->');

			const m1 = message;
			const m2 = (() => m1)();

			$$renderer.push(`<p>${$.escape(m1)}</p> <p>${$.escape(m2)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}