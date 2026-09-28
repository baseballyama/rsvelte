import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 1;
		let squared = $.derived(() => count * count);

		$$renderer.push(`<button>increment</button> <p>count: ${$.escape(count)}</p> `);

		if (count % 2 === 0) {
			$$renderer.push(`<!--[0--><p id="squared">squared: ${$.escape(squared())}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}