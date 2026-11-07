import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	$$renderer.push(`<div>content before</div> `);
	$$renderer.push(`<!--[-->`);

	{
		{
			function failed($$renderer, err, reset) {
				$$renderer.push(`<div>An error occurred! ${$.escape(err)}</div> `);
				Child($$renderer, { initial: 2 });
				$$renderer.push(`<!---->`);
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

	$$renderer.push(`<!--]-->`);
	$$renderer.push(` <div>content after</div>`);
}