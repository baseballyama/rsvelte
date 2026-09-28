import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	let recovered = false;

	{
		function failed($$renderer, error, reset) {
			$$renderer.push(`<p>failed: ${$.escape(error)}</p> <button>reset</button>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				if (recovered) {
					$$renderer.push(`<!--[0--><p>recovered</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
					Child($$renderer, {});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}