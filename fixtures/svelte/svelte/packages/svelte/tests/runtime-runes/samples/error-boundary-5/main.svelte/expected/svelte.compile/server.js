import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	{
		function failed($$renderer, e, retry) {
			$$renderer.push(`<div>too high</div> <button>Retry</button>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<!--[-->`);

				{
					$$renderer.push(`<!--[-->`);

					{
						Child($$renderer, {});
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}