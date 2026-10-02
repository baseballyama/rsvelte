import * as $ from 'svelte/internal/server';

function failed($$renderer) {
	$$renderer.push(`<div>Fallback!</div>`);
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('test');
		}

		let count = 0;

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<!---->${$.escape(count > 0 ? throw_error() : null)}`);
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(` <button>+</button>`);
	});
}