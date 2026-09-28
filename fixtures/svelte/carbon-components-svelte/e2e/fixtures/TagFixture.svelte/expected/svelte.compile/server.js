import * as $ from 'svelte/internal/server';
import { Tag } from "carbon-components-svelte";

export default function TagFixture($$renderer) {
	let showTag = true;

	if (showTag) {
		$$renderer.push('<!--[0-->');

		Tag($$renderer, {
			'data-testid': 'tag-filter',
			filter: true,
			title: 'Clear filter',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Carbon`);
			},
			$$slots: { default: true }
		});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	Tag($$renderer, {
		'data-testid': 'tag-static',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Static tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}