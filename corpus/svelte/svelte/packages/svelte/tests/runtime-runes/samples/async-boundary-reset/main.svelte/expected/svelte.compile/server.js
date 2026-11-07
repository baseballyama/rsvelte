import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Main($$renderer) {
	{
		function failed($$renderer, _, reset) {
			$$renderer.push(`<button>reset</button>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[!-->`);

			{
				$$renderer.push(`<!---->pending`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}