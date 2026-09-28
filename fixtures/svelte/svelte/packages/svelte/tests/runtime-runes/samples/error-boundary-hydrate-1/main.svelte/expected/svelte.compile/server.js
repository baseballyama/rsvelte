import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	let recovered = false;
	let reset_fn = void 0;

	{
		function failed($$renderer, error) {
			$$renderer.push(`<p>failed: ${$.escape(error)}</p>`);
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

	$$renderer.push(` <button>reset</button>`);
}