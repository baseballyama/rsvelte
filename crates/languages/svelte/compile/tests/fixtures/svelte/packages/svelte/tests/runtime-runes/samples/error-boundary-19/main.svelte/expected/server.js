import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		let test = $.derived(() => {
			if (count > 1) {
				throw new Error('test');
			}
		});

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<div>Count: ${$.escape(count)}</div> <button>Increment</button> ${$.escape(count)} / ${$.escape(test())}`);
		}

		$$renderer.push(`<!--]-->`);
		$$renderer.push(` `);
		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<div>Count: ${$.escape(count)}</div> <button>Increment</button> ${$.escape(count)} / ${$.escape(test())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}