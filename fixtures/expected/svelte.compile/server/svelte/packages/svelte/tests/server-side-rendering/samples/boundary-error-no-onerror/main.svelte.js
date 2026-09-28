import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throws() {
			throw new Error('component error');
		}

		{
			function failed($$renderer, error) {
				$$renderer.push(`<p>caught: ${$.escape(error)}</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<p>${$.escape(throws())}</p>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}