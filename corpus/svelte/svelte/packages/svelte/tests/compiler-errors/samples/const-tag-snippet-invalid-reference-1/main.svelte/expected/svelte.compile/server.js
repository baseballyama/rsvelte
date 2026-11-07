import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	{
		function failed($$renderer) {
			const foo = 'bar';

			$$renderer.push(`<!---->bar`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				const foo = 'bar';

				function other($$renderer) {
					$$renderer.push(`<!---->bar`);
				}

				$$renderer.push(`<!---->bar `);

				{
					function failed($$renderer) {
						$$renderer.push(`<!---->bar`);
					}

					$$renderer.boundary({ failed }, ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						{}

						$$renderer.push(`<!--]-->`);
					});
				}
			}

			$$renderer.push(`<!--]-->`);
		});
	}

	$$renderer.push(` `);

	{
		function failed($$renderer) {
			$$renderer.push(`<!---->bar`);
		}

		$$renderer.boundary({ failed }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			{
				const foo = 'bar';
			}

			$$renderer.push(`<!--]-->`);
		});
	}
}