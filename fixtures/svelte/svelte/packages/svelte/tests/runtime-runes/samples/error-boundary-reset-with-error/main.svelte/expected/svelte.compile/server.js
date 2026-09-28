import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let must_throw = false;

		function throw_error() {
			throw new Error('yikes!');
		}

		$$renderer.push(`<button>toggle</button> `);

		{
			function failed($$renderer, error, reset) {
				$$renderer.push(`<p>${$.escape(error.message)}</p> <button>reset</button>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<p>${$.escape(must_throw ? throw_error() : 'hello!')}</p>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}