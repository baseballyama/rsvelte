import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const func = 100;

		if (true) {
			$$renderer.push('<!--[0-->');

			const [func_1] = [[12, 13, 14]];

			$$renderer.push(`${$.escape((() => JSON.stringify(func_1))())}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}