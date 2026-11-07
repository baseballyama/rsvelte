import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Main($$renderer) {
	{
		function failed($$renderer, e) {
			$$renderer.push(`<p>caught: ${$.escape(e.message)}</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				Test($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}