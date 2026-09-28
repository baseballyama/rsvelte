import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	{
		function failed($$renderer) {
			$$renderer.push(`<div class="error">An error occurred!</div>`);
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