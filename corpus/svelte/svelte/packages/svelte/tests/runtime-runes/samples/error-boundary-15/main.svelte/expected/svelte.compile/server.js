import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('test');
		}

		$$renderer.push(`<!--[-->`);

		{
			{
				function failed($$renderer) {
					$$renderer.push(`<!---->${$.escape(throw_error())}`);
				}

				$$renderer.boundary({ failed }, ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					{
						Child($$renderer, {});
					}

					$$renderer.push(`<!--]-->`);
				});
			}
		}

		$$renderer.push(`<!--]-->`);
	});
}