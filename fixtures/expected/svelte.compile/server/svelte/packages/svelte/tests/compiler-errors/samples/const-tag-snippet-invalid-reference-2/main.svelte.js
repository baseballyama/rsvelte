import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	{
		function prop($$renderer) {
			const foo = 'bar';

			$$renderer.push(`<!---->bar`);
		}

		Component($$renderer, {
			prop,
			children: ($$renderer) => {
				const foo = 'bar';

				$$renderer.push(`<!---->bar `);

				{
					function prop($$renderer) {
						$$renderer.push(`<!---->bar`);
					}

					Component($$renderer, { prop, $$slots: { prop: true } });
				}

				$$renderer.push(`<!---->`);
			},
			$$slots: { prop: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function prop($$renderer) {
			$$renderer.push(`<!---->bar`);
		}

		Component($$renderer, {
			prop,
			children: ($$renderer) => {
				const foo = 'bar';
			},
			$$slots: { prop: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}