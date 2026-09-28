import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export let route = {};

export default function Main($$renderer) {
	$$renderer.push(`<button>reject</button> `);

	{
		function failed($$renderer) {
			$$renderer.push(`<p>failed</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[!-->`);

			{
				$$renderer.push(`<p>pending</p>`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}