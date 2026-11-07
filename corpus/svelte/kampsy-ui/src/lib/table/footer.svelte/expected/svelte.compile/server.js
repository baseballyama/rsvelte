import * as $ from 'svelte/internal/server';

export default function Footer($$renderer, $$props) {
	let { children = undefined } = $$props;

	$$renderer.push(`<tbody aria-hidden="true" class="table-row h-3"></tbody> <tfoot class="border-kui-light-gray-200 dark:border-kui-dark-gray-400 w-full border-t font-medium">`);

	if (children) {
		$$renderer.push('<!--[0-->');
		children($$renderer);
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></tfoot>`);
}