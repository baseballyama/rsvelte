import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function maybe_throw() {
			if (count > 1) {
				throw new Error('test');
			}

			return count;
		}

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<div>Count: ${$.escape(count)}</div> <button>Increment</button> ${$.escape(count)} / ${$.escape(maybe_throw())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}