import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];

	$$renderer.push(`<svg><!--[-->`);

	const each_array = $.ensure_array_like(iconNode);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let [tag, attrs] = each_array[$$index];

		$.element($$renderer, tag, () => {
			$$renderer.push(`${$.attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
		});
	}

	$$renderer.push(`<!--]--></svg><svg>`);

	$.element($$renderer, "path", void 0, () => {
		$$renderer.push(`<foreignObject>`);

		$.element($$renderer, "span", void 0, () => {
			$$renderer.push(`ok`);
		});

		$$renderer.push(`</foreignObject><foreignObject>`);

		if (true) {
			$$renderer.push('<!--[0-->');

			$.element($$renderer, "span", void 0, () => {
				$$renderer.push(`ok`);
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></foreignObject>`);
	});

	$$renderer.push(`</svg>`);
}