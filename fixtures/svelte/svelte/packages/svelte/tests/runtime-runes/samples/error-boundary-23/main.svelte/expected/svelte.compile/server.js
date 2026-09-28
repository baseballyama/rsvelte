import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let fail = false;

		function error() {
			throw new Error('oops');
		}

		function attachment() {
			console.log('attachment');
		}

		{
			function failed($$renderer) {
				$$renderer.push(`<div>oops!</div>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<!---->${$.escape(fail ? error() : 'all good')} <button>fail</button>`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}