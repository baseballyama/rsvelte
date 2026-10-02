import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('oh no!');
		}

		let count = 0;

		{
			function failed($$renderer, e) {
				$$renderer.push(`<div>${$.escape(e.message)}</div>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<!---->${$.escape(count > 0 ? throw_error() : null)}`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(` <button>+</button>`);
	});
}