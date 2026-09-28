import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let must_throw = false;
		let reset = null;

		function throw_error() {
			throw new Error("error on template render");
		}

		$$renderer.push(`<!--[-->`);

		{
			{
				function failed($$renderer) {
					$$renderer.push(`<div>err</div>`);
				}

				$$renderer.boundary({ failed }, ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					{
						$$renderer.push(`<!---->${$.escape(must_throw ? throw_error() : 'normal content')}`);
					}

					$$renderer.push(`<!--]-->`);
				});
			}
		}

		$$renderer.push(`<!--]-->`);
		$$renderer.push(` <button>toggle</button>`);
	});
}