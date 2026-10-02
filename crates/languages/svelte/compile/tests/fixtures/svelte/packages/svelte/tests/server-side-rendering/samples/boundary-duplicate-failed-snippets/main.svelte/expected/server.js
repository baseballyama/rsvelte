import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	{
		const x = 0;

		$$renderer.push(`<div>`);

		{
			function failed($$renderer) {}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(` `);

		{
			function failed($$renderer) {}

			$$renderer.boundary({ failed }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{}

				$$renderer.push(`<!--]-->`);
			});
		}

		$$renderer.push(`</div>`);
	}
}