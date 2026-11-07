import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	{
		function failed($$renderer, error, reset) {
			$$renderer.push(`<button>oops! try again</button>`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				FlakyComponent($$renderer, {});
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}