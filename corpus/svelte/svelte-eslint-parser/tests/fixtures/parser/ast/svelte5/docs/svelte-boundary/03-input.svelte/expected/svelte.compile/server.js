import * as $ from 'svelte/internal/server';

function failed($$renderer, error, reset) {
	$$renderer.push(`<button>oops! try again</button>`);
}

export default function _3_input($$renderer) {
	$$renderer.boundary({ failed }, ($$renderer) => {
		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<!---->...`);
		}

		$$renderer.push(`<!--]-->`);
	});
}