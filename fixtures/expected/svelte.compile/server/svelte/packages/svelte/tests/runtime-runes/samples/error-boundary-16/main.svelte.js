import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	{
		function failed($$renderer, err, reset) {
			$$renderer.push(`<div>An error occurred!</div> `);
			Child($$renderer, {});
			$$renderer.push(`<!---->`);
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