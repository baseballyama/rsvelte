import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	{
		function failed($$renderer) {
			$$renderer.push(`<p>error occurred</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<p>This should be removed</p> `);

				if (true) {
					$$renderer.push('<!--[0-->');
					Child($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}