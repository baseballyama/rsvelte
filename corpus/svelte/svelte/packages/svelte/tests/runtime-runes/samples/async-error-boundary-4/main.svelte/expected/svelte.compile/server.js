import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let open = false;

	{
		function failed($$renderer) {
			$$renderer.push(`<p>error escaped containment</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				$$renderer.push(`<button>show</button> `);

				if (open) {
					$$renderer.push('<!--[0-->');

					{
						function failed($$renderer) {
							$$renderer.push(`<p>error was contained</p>`);
						}

						$$renderer.boundary({ failed }, ($$renderer) => {
							$$renderer.push(`<!--[!-->`);

							{
								$$renderer.push(`<p>loading…</p>`);
							}

							$$renderer.push(`<!--]-->`);
						});
					}
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}