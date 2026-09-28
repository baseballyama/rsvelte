import * as $ from 'svelte/internal/server';

export default function Points($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	$.slot($$renderer, $$props, 'default', {}, () => {
		$$renderer.push(`<circle${$.attr('cx', 10)}${$.attr('cy', 10)}${$.attr('r', 5)}></circle>`);
	});

	$$renderer.push(`<!--]-->`);
}