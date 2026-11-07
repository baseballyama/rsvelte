import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`${$.html("some html")} `);

		if (false && ({}).x === 34) {
			$$renderer.push(`<!--[0-->true`);
		} else if (false) {
			$$renderer.push(`<!--[1-->false`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		$.await(
			$$renderer,
			[],
			() => {
				const x = 43;

				$$renderer.push(`43`);
			},
			(i) => {
				$$renderer.push(`${$.escape(i)}`);
			}
		);

		$$renderer.push(`<!--]--> `);

		$.await($$renderer, [], () => {}, (i) => {
			$$renderer.push(`stuff`);
		});

		$$renderer.push(`<!--]--> <!---->`);

		{
			$$renderer.push(`dlkdj`);
		}

		$$renderer.push(`<!---->`);
	});
}