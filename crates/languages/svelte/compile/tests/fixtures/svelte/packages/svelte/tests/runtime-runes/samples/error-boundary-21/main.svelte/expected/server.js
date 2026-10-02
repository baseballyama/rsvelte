import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<button></button> `);

	{
		function failed($$renderer) {
			$$renderer.push(`<div>${$.escape(count)}</div>`);
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