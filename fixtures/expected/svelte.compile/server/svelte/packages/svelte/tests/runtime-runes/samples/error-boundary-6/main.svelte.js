import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('test');
		}

		let count = 0;
		let error = void 0;

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<!---->${$.escape(count > 0 ? throw_error() : null)}`);
		}

		$$renderer.push(`<!--]-->`);
		$$renderer.push(` <button>+</button> `);

		if (error) {
			$$renderer.push(`<!--[0--><div>There is an error!</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}