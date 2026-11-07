import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer) {
	$.await(
		$$renderer,
		expression,
		() => {
			$$renderer.push(`...`);
		},
		(name) => {
			$$renderer.push(`...`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		expression,
		() => {
			$$renderer.push(`...`);
		},
		(name) => {
			$$renderer.push(`...`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await($$renderer, expression, () => {}, (name) => {
		$$renderer.push(`...`);
	});

	$$renderer.push(`<!--]--> `);
	$.await($$renderer, expression, () => {}, () => {});
	$$renderer.push(`<!--]-->`);
}