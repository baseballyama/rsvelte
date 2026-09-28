import * as $ from 'svelte/internal/server';
import FlakyComponent from "./FlakyComponent.svelte";

export default function Main($$renderer) {
	let test = 1;

	$$renderer.push(`<button></button> `);

	{
		function failed($$renderer) {
			$$renderer.push(`<p>${$.escape(double)}</p>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				const double = test * 2;

				FlakyComponent($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}