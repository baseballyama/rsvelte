import * as $ from 'svelte/internal/server';

function failed($$renderer, error) {
	$$renderer.push(`<p>caught: ${$.escape(error)}</p>`);
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throws() {
			throw new Error('you are not supposed to see this message');
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<p>${$.escape(throws())}</p>`);
			}

			$$renderer.push(`<!--]-->`);
		});
	});
}