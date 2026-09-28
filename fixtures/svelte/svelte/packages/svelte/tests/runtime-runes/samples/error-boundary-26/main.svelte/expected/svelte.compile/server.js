import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		{
			function failed($$renderer, error) {
				$$renderer.push(`<p>caught: ${$.escape(error)}</p>`);
			}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<!---->${$.escape((() => {
						throw 'catch me';
					})())}`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}
	});
}