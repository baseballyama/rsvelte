import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<button>change</button> `);

	{
		function failed($$renderer) {
			$$renderer.push(`<p>Error occurred</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				Child($$renderer, { count });
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}