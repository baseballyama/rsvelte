import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { query } = $$props;

		function search(q) {
			throw new Error(q);
		}

		{
			function failed($$renderer, error) {
				$$renderer.push(`<p class="error">${$.escape(error.message)}</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<p>${$.escape(search(query))}</p>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}