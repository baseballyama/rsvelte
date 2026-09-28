import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('test');
		}

		let count = 0;
		let onerror = (e) => console.log('error caught');

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<!---->${$.escape(count > 0 ? throw_error() : null)}`);
		}

		$$renderer.push(`<!--]-->`);
		$$renderer.push(` <button>+</button> <button>change error message</button>`);
	});
}