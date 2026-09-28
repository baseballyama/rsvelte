import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throws() {
			throw new Error('you are not supposed to see this message');
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